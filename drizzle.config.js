/** @type { import("drizzle-kit").Config } */
export default {
    schema: "./utils/schema.js",
    dialect: 'postgresql',
    dbCredentials: {
      url: 'postgres://default:kD4eFJHvgN3T@ep-snowy-resonance-a4c78zyn-pooler.us-east-1.aws.neon.tech:5432/verceldb?sslmode=require',
    }
  };