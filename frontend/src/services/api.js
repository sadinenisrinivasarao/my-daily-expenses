import axios from "axios";

export default axios.create({
  baseURL: "https://my-daily-expenses-eight.vercel.app/api"
});
