import React, { useState } from "react";
import axios from "axios";
import YtPlaylistURL from "./YtPlaylistURL";
import "./Page.css";

type Durations = {
  [key: number]: string;
};

const YouTubePlaylistDuration: React.FC = () => {
  const [playlistUrl, setPlaylistUrl] = useState<string>("");
  const [durations, setDurations] = useState<Durations>({});
  const [error, setError] = useState<string | null>(null);
  const [listId, setListId] = useState<string | null>("");
  const [loading, setLoading] = useState<boolean>(false);

  const extractPlaylistId = (url: string): string | null => {
    try {
      const urlObj = new URL(url);
      return urlObj.searchParams.get("list");
    } catch {
      return null;
    }
  };

  const getPlaylistVideos = async (
    playlistId: string,
    apiKey: string
  ): Promise<string[]> => {
    let videos: string[] = [];
    let nextPageToken = "";

    do {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/playlistItems",
        {
          params: {
            part: "contentDetails",
            maxResults: 50,
            playlistId,
            key: apiKey,
            pageToken: nextPageToken,
          },
        }
      );

      videos = videos.concat(
        response.data.items.map((item: any) => item.contentDetails.videoId)
      );
      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken);

    return videos;
  };

  const getVideoDurations = async (
    videoIds: string[],
    apiKey: string
  ): Promise<string[]> => {
    let durations: string[] = [];

    for (let i = 0; i < videoIds.length; i += 50) {
      const response = await axios.get(
        "https://www.googleapis.com/youtube/v3/videos",
        {
          params: {
            part: "contentDetails",
            id: videoIds.slice(i, i + 50).join(","),
            key: apiKey,
          },
        }
      );

      durations = durations.concat(
        response.data.items.map((item: any) => item.contentDetails.duration)
      );
    }

    return durations;
  };

  const iso8601ToSeconds = (duration: string): number => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    const hours = match && match[1] ? parseInt(match[1]) : 0;
    const minutes = match && match[2] ? parseInt(match[2]) : 0;
    const seconds = match && match[3] ? parseInt(match[3]) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  };

  const calculateDurations = async () => {
    try {
      setLoading(true);
      setError(null);
      setDurations({}); // Сбрасываем ошибку перед новым запросом
      const playlistId = extractPlaylistId(playlistUrl);
      setListId(playlistId);
      console.log(listId);
      if (!playlistId) {
        setError("Invalid playlist URL");
        setLoading(false);
        return;
      }

      const videoIds = await getPlaylistVideos(
        playlistId,
        "AIzaSyAjEq_I8ifnztGPdBBbxwxSqGX8y2jzsqo"
      );
      const durations = await getVideoDurations(
        videoIds,
        "AIzaSyAjEq_I8ifnztGPdBBbxwxSqGX8y2jzsqo"
      );

      const totalSeconds = durations.reduce(
        (total, duration) => total + iso8601ToSeconds(duration),
        0
      );

      const speeds = [1, 1.25, 1.5, 2];
      const calculatedDurations: Durations = {};

      speeds.forEach((speed) => {
        const adjustedSeconds = totalSeconds / speed;
        const hours = Math.floor(adjustedSeconds / 3600);
        const minutes = Math.floor((adjustedSeconds % 3600) / 60);
        const seconds = Math.floor(adjustedSeconds % 60);
        calculatedDurations[
          speed
        ] = `${hours} hours, ${minutes} minutes, ${seconds} seconds`;
      });

      setDurations(calculatedDurations);
    } catch (error) {
      console.error("Error fetching playlist duration:", error);
      setError("Error fetching playlist duration");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="title">YouTube Playlist Duration</h1>
      <div className="bottom">
        <div className={`${playlistUrl ? "green-left" : "left"}`}>
          <button
            onClick={calculateDurations}
            className={`${playlistUrl ? "green" : ""}`}
          >
            Calculate Duration
          </button>
          <input
            type="text"
            placeholder="Enter Playlist URL"
            className={`${playlistUrl ? "green-inp" : ""}`}
            value={playlistUrl}
            onChange={(e) => setPlaylistUrl(e.target.value)}
          />
          <p>Ps: Playlist must be below than 500 vids</p>
          <h2 className={`${playlistUrl ? "green-btn" : ""}`}>
            Write Your URL Here 👇
          </h2>
        </div>
        {loading && (
          <div className="flex flex-col justify-center items-center mr-40">
            <div className="shapes"></div>
            <p>Counting...</p>
          </div>
        )}
        {error && <div className="error">{error}</div>}
        {Object.keys(durations).length > 0 && (
          <div className="right">
            <div className="res">
              <div>
                Length at Normal Speed: <b>{durations[1]}</b>
              </div>
              <div>
                Length at <span>1.25x</span> Speed: <b>{durations[1.25]}</b>
              </div>
              <div>
                Length at <span>1.5x</span> Speed: <b>{durations[1.5]}</b>
              </div>
              <div>
                Length at <span>2x</span> Speed: <b>{durations[2]}</b>
              </div>
            </div>
            <YtPlaylistURL PlaylistID={listId} />
          </div>
        )}
      </div>
      <h1 className="footer">
        Made with <span>❤</span> by{" "}
        <a href="http://www.linkedin.com/in/akhror-khidirov" target="blank">Ahror.</a>
        Buy me a <a href="http://ko-fi.com/djeral07" target="blank">coffee</a>
      </h1>
    </div>
  );
};

export default YouTubePlaylistDuration;
