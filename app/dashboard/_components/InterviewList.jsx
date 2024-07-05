"use client";
import { db } from "@/utils/db";
import { MockInterview } from "@/utils/schema";
import { useUser } from "@clerk/nextjs";
import { desc, eq } from "drizzle-orm";
import React, { useEffect, useState } from "react";
import InterviewItemCard from "./InterviewItemCard";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const InterviewList = () => {
  const { user } = useUser();
  const [InterviewList, setInterviewList] = useState([]);

  useEffect(() => {
    user && getInterviewList();
  }, [user]);

  const getInterviewList = async () => {
    try {
      const { data, error } = await supabase
        .from('mock_interviews')
        .select('*')
        .eq('created_by', user?.primaryEmailAddress?.emailAddress)
        .order('id', { ascending: false });

      if (error) throw error;

      console.log(
        "🚀 ~ file: InterviewList.jsx:14 ~ getInterviewList ~ getInterviewList:",
        data
      );
      setInterviewList(data);
    } catch (error) {
      console.error("Error fetching interview list:", error);
    }
  };

  return (
    <div>
      <h2 className="font-medium text-xl">Previous Mock Interview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 my-3">
        {InterviewList&&InterviewList.map((interview,index)=>(
            <InterviewItemCard interview={interview} key={index}/>
        ))}
      </div>
    </div>
  );
};

export default InterviewList;
