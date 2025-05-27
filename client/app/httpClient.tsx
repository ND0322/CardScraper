import axios from "axios";
export default axios.create({
  baseURL: "http://10.0.0.37:5000",
  withCredentials: true,
});
