import { DownloadTimerWrapper } from "./timer-wrapper";

const nullpkDownloadPlugin = {
  identifier: "nullpk-download",
  name: "NullpkWeb Download Integration",
  description: "Renders the download timer on product pages.",
  version: "1.0.0",
  components: {
    blog_post_middle: DownloadTimerWrapper
  }
};

export default nullpkDownloadPlugin;
