import axios from "axios";

class GoogleService {
  async getUserInfo(googleAccessToken) {
    const response = await axios.get(process.env.GOOGLEAPIS_USERINFO, {
      headers: { Authorization: `Bearer ${googleAccessToken}` },
    });
    return response.data;
  }
}

export default new GoogleService();
