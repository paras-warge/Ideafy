import axios from "axios";

const APIHUT_BASE_URL = "https://apihut.in/api/download/videos";
const APIHUT_KEY = process.env.EXPO_PUBLIC_APIHUT_KEY;

console.log("API KEY:", APIHUT_KEY);

export const getYoutubeId = (input) => {
  try {
    if (!input) return null;

    const trimmed = input.trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }

    const regExp =
      /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|shorts\/)([^#&?]{11}).*/;

    const match = trimmed.match(regExp);

    return match ? match[2] : null;
  } catch {
    return null;
  }
};

export const getVideoDetails = async (youtubeUrl) => {
  const videoId = getYoutubeId(youtubeUrl);

  if (!videoId) {
    throw new Error("Invalid YouTube URL");
  }

  console.log(" Fetching from ApiHut:", videoId);

  try {
    const response = await axios.post(
      APIHUT_BASE_URL,
      {
        type: "youtube",
        user_id: "",
        video_url: `https://youtu.be/${videoId}`,
        with_metadata: true,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Avatar-Key": APIHUT_KEY,
        },
      }
    );

    console.log("APIHut RAW RESPONSE:", response.data);

    if (
      response.data.success !== 1 ||
      !response.data.message?.data?.length
    ) {
      throw new Error("Invalid API response structure");
    }

    const videoData = response.data.message.data[0];

    return {
      title: "YouTube Video", 
      thumbnail:
        videoData.thumbnail ||
        `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
      formats: [
        {
          quality: "HD",
          url: videoData.url,
          size: "Auto",
        },
      ],
    };
  } catch (error) {
    console.log(" APIHut ERROR:", error.response?.data || error.message);
    throw new Error("Failed to fetch video from ApiHut");
  }
};
