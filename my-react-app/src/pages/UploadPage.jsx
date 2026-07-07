import UploadButton from "../components/UploadButton";
import UploadProgress from "../components/UploadProgress";
import useMultipartUpload from "../hooks/useMultipartUpload";

export default function UploadPage() {
  const { upload, progress, uploading } = useMultipartUpload();

  async function handleUpload(file) {
    try {
      await upload(file);

      alert("Upload Completed");
    } catch (err) {
      console.error(err);

      alert("Upload Failed");
    }
  }

  return (
    <div>
      <h1>Video Upload</h1>

      <UploadButton onUpload={handleUpload} />

      {uploading && <UploadProgress progress={progress} />}
    </div>
  );
}
