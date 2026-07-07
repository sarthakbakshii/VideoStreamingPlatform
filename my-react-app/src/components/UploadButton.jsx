export default function UploadButton({ onUpload }) {
  function handleChange(e) {
    const file = e.target.files[0];

    if (!file) return;

    onUpload(file);
  }

  return <input type="file" accept="video/*" onChange={handleChange} />;
}
