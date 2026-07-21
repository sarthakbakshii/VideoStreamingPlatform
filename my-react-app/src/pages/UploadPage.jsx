import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import UploadButton from '../components/UploadButton'
import UploadProgress from '../components/UploadProgress'
import useMultipartUpload from '../hooks/useMultipartUpload'
import './UploadPage.css'

export default function UploadPage() {
  const { upload, progress, uploading, error } = useMultipartUpload()
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [videoMeta, setVideoMeta] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [stage, setStage] = useState('idle') // idle | uploading | success | error
  const fileInputRef = useRef(null)
  const navigate = useNavigate()

  // Auto-hide error after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setStage('idle')
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleFileSelect = (selectedFile) => {
    if (!selectedFile) return

    // Validate file
    const allowedTypes = ['video/mp4', 'video/quicktime', 'video/x-matroska', 'video/webm']
    if (!allowedTypes.includes(selectedFile.type)) {
      alert('Unsupported format. Use MP4, MOV, MKV, or WebM.')
      return
    }

    if (selectedFile.size > 500 * 1024 * 1024) {
      alert('File too large. Maximum size is 500 MB.')
      return
    }

    setFile(selectedFile)
    setPreview(URL.createObjectURL(selectedFile))
    setStage('idle')

    // Extract video metadata
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.onloadedmetadata = () => {
      setVideoMeta({
        duration: video.duration,
        width: video.videoWidth,
        height: video.videoHeight,
      })
      URL.revokeObjectURL(video.src)
    }
    video.src = URL.createObjectURL(selectedFile)
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0])
    }
  }

  const handleUpload = async (selectedFile) => {
    try {
      setStage('uploading')
      await upload(selectedFile)
      setStage('success')

      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err) {
      console.error(err)
      setStage('error')
    }
  }

  const resetUpload = () => {
    setFile(null)
    setPreview(null)
    setVideoMeta(null)
    setStage('idle')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="upload-page">
      {/* Cinematic Background */}
      <div className="upload-bg">
        <div className="bg-gradient"></div>
        <div className="bg-grid"></div>
        <div className="bg-glow glow-1"></div>
        <div className="bg-glow glow-2"></div>
      </div>

      <div className="upload-container">
        {/* Header */}
        <div className="upload-header">
          <button className="back-btn" onClick={() => navigate('/')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Browse
          </button>
          <div className="header-content">
            <div className="badge">NEW RELEASE</div>
            <h1 className="title">Upload Your Story</h1>
            <p className="subtitle">Share your cinematic masterpiece with the world</p>
          </div>
        </div>

        {/* Main Upload Area */}
        <div className="upload-main">
          {/* Idle State - Drop Zone */}
          {stage === 'idle' && !file && (
            <div
              className={`drop-zone ${dragActive ? 'active' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/quicktime,video/x-matroska,video/webm"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="file-input"
              />

              <div className="drop-content">
                <div className="upload-icon-wrapper">
                  <div className="upload-icon-ring"></div>
                  <svg className="upload-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                </div>

                <h2 className="drop-title">
                  {dragActive ? 'Drop it like it\'s hot 🔥' : 'Drag & Drop Your Video'}
                </h2>
                <p className="drop-subtitle">or click to browse your files</p>

                <div className="format-badges">
                  <span className="format-badge">MP4</span>
                  <span className="format-badge">MOV</span>
                  <span className="format-badge">MKV</span>
                  <span className="format-badge">WebM</span>
                </div>

                <div className="size-limit">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  Maximum file size: 500 MB
                </div>
              </div>
            </div>
          )}

          {/* File Selected - Preview */}
          {stage === 'idle' && file && (
            <div className="file-preview">
              <div className="preview-video-wrapper">
                <video src={preview} className="preview-video" controls />
                <div className="preview-overlay"></div>
              </div>

              <div className="file-details">
                <div className="file-info">
                  <h3 className="file-name" title={file.name}>{file.name}</h3>
                  <div className="file-meta">
                    <span className="meta-tag">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                        <polyline points="14 2 14 8 20 8"></polyline>
                      </svg>
                      {formatFileSize(file.size)}
                    </span>
                    {videoMeta && (
                      <>
                        <span className="meta-tag">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                            <line x1="8" y1="21" x2="16" y2="21"></line>
                            <line x1="12" y1="17" x2="12" y2="21"></line>
                          </svg>
                          {videoMeta.width}×{videoMeta.height}
                        </span>
                        <span className="meta-tag">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <polyline points="12 6 12 12 16 14"></polyline>
                          </svg>
                          {formatDuration(videoMeta.duration)}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="file-actions">
                  <button className="action-btn secondary" onClick={resetUpload}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"></polyline>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                    Remove
                  </button>
                  <UploadButton
                    onUpload={handleUpload}
                    file={file}
                    className="action-btn primary"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                    Start Upload
                  </UploadButton>
                </div>
              </div>
            </div>
          )}

          {/* Uploading State */}
          {stage === 'uploading' && (
            <div className="upload-progress-container">
              <UploadProgress progress={progress} />
              <div className="progress-info">
                <h3 className="progress-title">Sending to the cloud...</h3>
                <p className="progress-subtitle">Your video is being uploaded securely</p>
              </div>
            </div>
          )}

          {/* Success State */}
          {stage === 'success' && (
            <div className="success-screen">
              <div className="success-animation">
                <div className="success-check">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <div className="success-ring"></div>
              </div>
              <h2 className="success-title">Upload Complete! </h2>
              <p className="success-subtitle">
                Your video is being processed and will appear in your library shortly
              </p>
              <button className="success-btn" onClick={() => navigate('/')}>
                Back to Library
              </button>
            </div>
          )}

          {/* Error State */}
          {stage === 'error' && (
            <div className="error-screen">
              <div className="error-icon">
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h2 className="error-title">Upload Failed</h2>
              <p className="error-subtitle">
                {error || 'Something went wrong. Please try again.'}
              </p>
              <button className="error-btn" onClick={resetUpload}>
                Try Again
              </button>
            </div>
          )}
        </div>

        {/* Features Strip */}
        <div className="features-strip">
          <div className="feature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            <div>
              <div className="feature-title">Secure Upload</div>
              <div className="feature-desc">End-to-end encrypted</div>
            </div>
          </div>
          <div className="feature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
            </svg>
            <div>
              <div className="feature-title">Lightning Fast</div>
              <div className="feature-desc">CDN-powered delivery</div>
            </div>
          </div>
          <div className="feature">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
              <line x1="8" y1="21" x2="16" y2="21"></line>
              <line x1="12" y1="17" x2="12" y2="21"></line>
            </svg>
            <div>
              <div className="feature-title">Multi-Quality</div>
              <div className="feature-desc">Auto 1080p/720p/480p</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}