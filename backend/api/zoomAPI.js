require("dotenv").config();
const axios = require("axios");
const btoa = require("btoa");

const getZoomAPIAccessToken = async () => {
  try {
    const base64Credentials = btoa(`${process.env.CLIENT_ID}:${process.env.CLIENT_SECRET}`);

    const resp = await axios({
      method: "POST",
      url: "https://zoom.us/oauth/token?grant_type=client_credentials",
      headers: {
        Authorization: `Basic ${base64Credentials}`,
      },
    });

    return resp.data.access_token;
  } catch (err) {
    console.error("获取Zoom access token失败:", err);
    throw err;
  }
};

console.log(getZoomAPIAccessToken());

/**
 * Generic function for making requests to the Zoom API
 * @param {string} method - Request method
 * @param {string | URL} endpoint - Zoom API Endpoint
 * @param {string} token - Access Token
 * @param {object} [data=null] - Request data
 */
const makeZoomAPIRequest = async (method, endpoint, data = null) => {
  try {
    const resp = await axios({
      method: method,
      url: endpoint,
      headers: {
        Authorization: "Bearer " + `${await getZoomAPIAccessToken()} `,
        "Content-Type": "application/json",
      },
    });

    console.log("ZakMeeting", resp.data);

    return resp.data;
  } catch (err) {
    if (err.status == undefined) {
      console.log("Error : ", err);
    }
  }
};

module.exports = {
  getZoomAPIAccessToken,
  makeZoomAPIRequest,
};
