type Props = {
  PlaylistID: any;
  width?: string;
  height?: string;
};

const YtPlaylistURL = ({
  PlaylistID,
  width = "100%",
  height = "315px",
}: Props) => {
  const src = `https://www.youtube.com/embed/videoseries?si=FLThOvWQ0A0wg73b&amp;list=${PlaylistID}`;
  console.log(src);
  return (
    <iframe
      width={width}
      height={height}
      src={src}
      frameBorder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      title="YouTube video player"
    ></iframe>
  );
};

export default YtPlaylistURL;
