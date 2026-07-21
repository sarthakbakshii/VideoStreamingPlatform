// // // import React, { useEffect, useRef, useState } from 'react'
// // // import { useParams, useNavigate } from 'react-router-dom'
// // // import Hls from 'hls.js'
// // // import { getManifestUrl, getApiUrl } from '../config/env'
// // // import './VideoPlayer.css'
// // // import axios from 'axios'

// // // function VideoPlayer() {
// // //     const { videoId } = useParams()
// // //     const navigate = useNavigate()
// // //     const videoRef = useRef(null)
// // //     const hlsRef = useRef(null)

// // //     const [qualities, setQualities] = useState([])
// // //     const [currentQuality, setCurrentQuality] = useState('auto')
// // //     const [showQualityMenu, setShowQualityMenu] = useState(false)
// // //     const [videoData, setVideoData] = useState(null)
// // //     const [loading, setLoading] = useState(true)
// // //     const [isPlaying, setIsPlaying] = useState(false)
// // //     const [currentTime, setCurrentTime] = useState(0)
// // //     const [duration, setDuration] = useState(0)
// // //     const [volume, setVolume] = useState(1)
// // //     const [isFullscreen, setIsFullscreen] = useState(false)
// // //     const [showControls, setShowControls] = useState(true)
// // //     const controlsTimeoutRef = useRef(null)
// // //     const [isSwitchingQuality, setIsSwitchingQuality] = useState(false)

// // //     // Fetch video metadata
// // //     // Fetch video metadata
// // //     useEffect(() => {
// // //         const fetchVideoData = async () => {
// // //             try {
// // //                 // Fix: Use getApiUrl with path parameter
// // //                 const apiUrl = `${getApiUrl(`/api/videos/${videoId}`)}`
// // //                 const response = await axios.get(apiUrl)
// // //                 setVideoData(response.data)
// // //             } catch (err) {
// // //                 console.error('Error fetching video data:', err)
// // //             }
// // //         }
// // //         fetchVideoData()
// // //     }, [videoId])

// // //     // Initialize HLS
// // //     useEffect(() => {
// // //         const video = videoRef.current
// // //         if (!video) return

// // //         const manifestUrl = getManifestUrl(videoId)

// // //         if (Hls.isSupported()) {
// // //             const hls = new Hls({
// // //                 // ABR Configuration
// // //                 abrEwmaDefaultEstimate: 500000, // 500kbps initial estimate
// // //                 abrBandWidthFactor: 0.95,
// // //                 abrBandWidthUpFactor: 0.7,
// // //                 abrMaxWithRealBitrate: true,

// // //                 // Buffer configuration
// // //                 maxBufferLength: 30,
// // //                 maxMaxBufferLength: 600,
// // //                 maxBufferSize: 60 * 1000 * 1000, // 60MB
// // //                 maxBufferHole: 0.5,

// // //                 // Live sync
// // //                 liveSyncDurationCount: 3,
// // //             })

// // //             hlsRef.current = hls

// // //             hls.loadSource(manifestUrl)
// // //             hls.attachMedia(video)

// // //             hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
// // //                 // Helper: Map bitrate to resolution label when height is missing
// // //                 const getResolutionFromBitrate = (bitrate) => {
// // //                     if (!bitrate) return 'Unknown';
// // //                     const kbps = bitrate / 1000;
// // //                     if (kbps < 1000) return '360p';
// // //                     if (kbps < 2000) return '480p';
// // //                     if (kbps < 4000) return '720p';
// // //                     if (kbps < 8000) return '1080p';
// // //                     return '1440p';
// // //                 };

// // //                 // Extract available qualities from master playlist
// // //                 const availableQualities = [
// // //                     { label: 'Auto', value: -1, height: 0, bitrate: 0 },
// // //                     ...data.levels.map((level, index) => {
// // //                         // Use actual height if available, otherwise estimate from bitrate
// // //                         const height = level.height > 0 ? level.height : 0;
// // //                         const label = height > 0
// // //                             ? `${height}p`
// // //                             : getResolutionFromBitrate(level.bitrate);

// // //                         return {
// // //                             label,
// // //                             value: index,
// // //                             height,
// // //                             bitrate: level.bitrate,
// // //                             width: level.width,
// // //                         };
// // //                     })
// // //                 ];

// // //                 // Sort qualities from lowest to highest (Auto stays first)
// // //                 const auto = availableQualities[0];
// // //                 const sorted = availableQualities.slice(1)
// // //                     .sort((a, b) => a.bitrate - b.bitrate);

// // //                 setQualities([auto, ...sorted]);
// // //                 setLoading(false);
// // //             });

// // //             hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
// // //                 // Hide loading spinner after quality switch completes
// // //                 setIsSwitchingQuality(false)
// // //                 const level = hls.levels[data.level]
// // //                 const height = level.height > 0 ? level.height : Math.round(level.bitrate / 1000)
// // //                 console.log('Quality switched to:', height > 0 ? `${height}p` : `${Math.round(level.bitrate / 1000)} kbps`)
// // //             })

// // //             hls.on(Hls.Events.ERROR, (event, data) => {
// // //                 if (data.fatal) {
// // //                     console.error('HLS fatal error:', data)
// // //                     switch (data.type) {
// // //                         case Hls.ErrorTypes.NETWORK_ERROR:
// // //                             hls.startLoad()
// // //                             break
// // //                         case Hls.ErrorTypes.MEDIA_ERROR:
// // //                             hls.recoverMediaError()
// // //                             break
// // //                         default:
// // //                             hls.destroy()
// // //                             break
// // //                     }
// // //                 }
// // //             })

// // //             return () => {
// // //                 hls.destroy()
// // //             }
// // //         } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
// // //             // Native HLS support (Safari)
// // //             video.src = manifestUrl
// // //             video.addEventListener('loadedmetadata', () => {
// // //                 setLoading(false)
// // //             })
// // //         }

// // //         return () => {
// // //             if (hlsRef.current) {
// // //                 hlsRef.current.destroy()
// // //             }
// // //         }
// // //     }, [videoId])

// // //     // Handle quality change
// // //     useEffect(() => {
// // //         if (!hlsRef.current) return

// // //         if (currentQuality === 'Auto') {
// // //             hlsRef.current.currentLevel = -1
// // //             setIsSwitchingQuality(true) // Show loading
// // //         } else {
// // //             const quality = qualities.find(q => q.label === currentQuality)
// // //             if (quality && quality.value !== undefined) {
// // //                 hlsRef.current.currentLevel = quality.value
// // //                 setIsSwitchingQuality(true) // Show loading
// // //             }
// // //         }
// // //     }, [currentQuality, qualities]);

// // //     // Video event listeners
// // //     useEffect(() => {
// // //         const video = videoRef.current
// // //         if (!video) return

// // //         const handleTimeUpdate = () => setCurrentTime(video.currentTime)
// // //         const handleDurationChange = () => setDuration(video.duration)
// // //         const handlePlay = () => setIsPlaying(true)
// // //         const handlePause = () => setIsPlaying(false)
// // //         const handleVolumeChange = () => setVolume(video.volume)
// // //         const handleFullscreenChange = () => {
// // //             setIsFullscreen(!!document.fullscreenElement)
// // //         }

// // //         video.addEventListener('timeupdate', handleTimeUpdate)
// // //         video.addEventListener('durationchange', handleDurationChange)
// // //         video.addEventListener('play', handlePlay)
// // //         video.addEventListener('pause', handlePause)
// // //         video.addEventListener('volumechange', handleVolumeChange)
// // //         document.addEventListener('fullscreenchange', handleFullscreenChange)

// // //         return () => {
// // //             video.removeEventListener('timeupdate', handleTimeUpdate)
// // //             video.removeEventListener('durationchange', handleDurationChange)
// // //             video.removeEventListener('play', handlePlay)
// // //             video.removeEventListener('pause', handlePause)
// // //             video.removeEventListener('volumechange', handleVolumeChange)
// // //             document.removeEventListener('fullscreenchange', handleFullscreenChange)
// // //         }
// // //     }, [])

// // //     // Auto-hide controls
// // //     const handleMouseMove = () => {
// // //         setShowControls(true)
// // //         clearTimeout(controlsTimeoutRef.current)
// // //         controlsTimeoutRef.current = setTimeout(() => {
// // //             if (isPlaying) setShowControls(false)
// // //         }, 3000)
// // //     }

// // //     const togglePlay = () => {
// // //         const video = videoRef.current
// // //         if (video.paused) {
// // //             video.play()
// // //         } else {
// // //             video.pause()
// // //         }
// // //     }

// // //     const handleSeek = (e) => {
// // //         const video = videoRef.current
// // //         const rect = e.currentTarget.getBoundingClientRect()
// // //         const pos = (e.clientX - rect.left) / rect.width
// // //         video.currentTime = pos * duration
// // //     }

// // //     const handleVolumeChange = (e) => {
// // //         const video = videoRef.current
// // //         const newVolume = e.target.value
// // //         video.volume = newVolume
// // //         setVolume(newVolume)
// // //     }

// // //     const toggleFullscreen = () => {
// // //         const container = document.querySelector('.video-player-container')
// // //         if (!document.fullscreenElement) {
// // //             container.requestFullscreen()
// // //         } else {
// // //             document.exitFullscreen()
// // //         }
// // //     }

// // //     const formatTime = (seconds) => {
// // //         const mins = Math.floor(seconds / 60)
// // //         const secs = Math.floor(seconds % 60)
// // //         return `${mins}:${secs.toString().padStart(2, '0')}`
// // //     }

// // //     const selectQuality = (label) => {
// // //         setCurrentQuality(label)
// // //         setShowQualityMenu(false)
// // //     }

// // //     return (
// // //         <div className="video-player-page">
// // //             <button className="back-btn" onClick={() => navigate('/')}>
// // //                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                     <line x1="19" y1="12" x2="5" y2="12"></line>
// // //                     <polyline points="12 19 5 12 12 5"></polyline>
// // //                 </svg>
// // //                 Back to Browse
// // //             </button>

// // //             <div className="video-player-container" onMouseMove={handleMouseMove}>
// // //                 {loading && (
// // //                     <div className="loading-overlay">
// // //                         <div className="spinner"></div>
// // //                         <p>Loading video...</p>
// // //                     </div>
// // //                 )}


// // //                 {/* Quality Switching Loader */}
// // //                 {isSwitchingQuality && !loading && (
// // //                     <div className="quality-switching-overlay">
// // //                         <div className="quality-spinner"></div>
// // //                         <p>Switching to {currentQuality}...</p>
// // //                     </div>
// // //                 )}

// // //                 <video
// // //                     ref={videoRef}
// // //                     className={`video-element ${isSwitchingQuality ? 'quality-switching' : ''}`}
// // //                     onClick={togglePlay}
// // //                     playsInline
// // //                 />

// // //                 {/* Custom Controls */}
// // //                 <div className={`custom-controls ${showControls ? 'visible' : 'hidden'}`}>
// // //                     {/* Progress Bar */}
// // //                     <div className="progress-container" onClick={handleSeek}>
// // //                         <div className="progress-bar">
// // //                             <div
// // //                                 className="progress-filled"
// // //                                 style={{ width: `${(currentTime / duration) * 100}%` }}
// // //                             ></div>
// // //                         </div>
// // //                     </div>

// // //                     <div className="controls-bottom">
// // //                         <div className="controls-left">
// // //                             <button className="control-btn" onClick={togglePlay}>
// // //                                 {isPlaying ? (
// // //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
// // //                                         <rect x="6" y="4" width="4" height="16"></rect>
// // //                                         <rect x="14" y="4" width="4" height="16"></rect>
// // //                                     </svg>
// // //                                 ) : (
// // //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
// // //                                         <polygon points="5 3 19 12 5 21 5 3"></polygon>
// // //                                     </svg>
// // //                                 )}
// // //                             </button>

// // //                             <div className="volume-control">
// // //                                 <button className="control-btn">
// // //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                                         <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
// // //                                         <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
// // //                                     </svg>
// // //                                 </button>
// // //                                 <input
// // //                                     type="range"
// // //                                     min="0"
// // //                                     max="1"
// // //                                     step="0.1"
// // //                                     value={volume}
// // //                                     onChange={handleVolumeChange}
// // //                                     className="volume-slider"
// // //                                 />
// // //                             </div>

// // //                             <div className="time-display">
// // //                                 <span>{formatTime(currentTime)}</span>
// // //                                 <span>/</span>
// // //                                 <span>{formatTime(duration)}</span>
// // //                             </div>
// // //                         </div>

// // //                         <div className="controls-right">
// // //                             {/* Quality Selector */}
// // //                             <div className="quality-selector">
// // //                                 <button
// // //                                     className="control-btn quality-btn"
// // //                                     onClick={() => setShowQualityMenu(!showQualityMenu)}
// // //                                 >
// // //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                                         <circle cx="12" cy="12" r="3"></circle>
// // //                                         <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
// // //                                     </svg>
// // //                                     <span>{currentQuality}</span>
// // //                                 </button>

// // //                                 {showQualityMenu && (
// // //                                     <div className="quality-menu">
// // //                                         {qualities.map((quality) => (
// // //                                             <button
// // //                                                 key={quality.value}
// // //                                                 className={`quality-option ${currentQuality === quality.label ? 'active' : ''}`}
// // //                                                 onClick={() => selectQuality(quality.label)}
// // //                                             >
// // //                                                 <span className="quality-label">
// // //                                                     {quality.label}
// // //                                                     {currentQuality === quality.label && (
// // //                                                         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
// // //                                                             <polyline points="20 6 9 17 4 12"></polyline>
// // //                                                         </svg>
// // //                                                     )}
// // //                                                 </span>
// // //                                                 {quality.bitrate > 0 && (
// // //                                                     <span className="bitrate">
// // //                                                         {Math.round(quality.bitrate / 1000)} kbps
// // //                                                     </span>
// // //                                                 )}
// // //                                             </button>
// // //                                         ))}
// // //                                     </div>
// // //                                 )}
// // //                             </div>

// // //                             <button className="control-btn" onClick={toggleFullscreen}>
// // //                                 {isFullscreen ? (
// // //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                                         <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
// // //                                     </svg>
// // //                                 ) : (
// // //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// // //                                         <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
// // //                                     </svg>
// // //                                 )}
// // //                             </button>
// // //                         </div>
// // //                     </div>
// // //                 </div>
// // //             </div>

// // //             {/* Video Info */}
// // //             {videoData && (
// // //                 <div className="video-info-section">
// // //                     <h1 className="video-title">{videoData.title}</h1>
// // //                     <div className="video-meta">
// // //                         <span className="meta-item">{videoData.resolution || '1080p'}</span>
// // //                         <span className="meta-separator">•</span>
// // //                         <span className="meta-item">{new Date(videoData.createdAt).toLocaleDateString()}</span>
// // //                         <span className="meta-separator">•</span>
// // //                         <span className="meta-item">{Math.floor(videoData.duration / 60)}m {videoData.duration % 60}s</span>
// // //                     </div>
// // //                     <p className="video-description">
// // //                         Watch your uploaded video in stunning quality. Stream instantly across all your devices.
// // //                     </p>
// // //                 </div>
// // //             )}
// // //         </div>
// // //     )
// // // }

// // // export default VideoPlayer
// // import React, { useEffect, useRef, useState, useCallback } from 'react'
// // import { useParams, useNavigate } from 'react-router-dom'
// // import Hls from 'hls.js'
// // import axios from 'axios'
// // import { getManifestUrl, getApiUrl } from '../config/env'
// // import './VideoPlayer.css'

// // function VideoPlayer() {
// //     const { videoId } = useParams()
// //     const navigate = useNavigate()

// //     // Refs
// //     const videoRef = useRef(null)
// //     const hlsRef = useRef(null)
// //     const controlsTimeoutRef = useRef(null)
// //     const containerRef = useRef(null)

// //     // State
// //     const [qualities, setQualities] = useState([])
// //     const [currentQuality, setCurrentQuality] = useState('Auto')
// //     const [showQualityMenu, setShowQualityMenu] = useState(false)
// //     const [videoData, setVideoData] = useState(null)
// //     const [loading, setLoading] = useState(true)
// //     const [error, setError] = useState(null)
// //     const [isPlaying, setIsPlaying] = useState(false)
// //     const [currentTime, setCurrentTime] = useState(0)
// //     const [duration, setDuration] = useState(0)
// //     const [buffered, setBuffered] = useState(0)
// //     const [volume, setVolume] = useState(1)
// //     const [isMuted, setIsMuted] = useState(false)
// //     const [isFullscreen, setIsFullscreen] = useState(false)
// //     const [showControls, setShowControls] = useState(true)
// //     const [isSwitchingQuality, setIsSwitchingQuality] = useState(false)
// //     const [isBuffering, setIsBuffering] = useState(false)

// //     // Fetch video metadata
// //     useEffect(() => {
// //         const fetchVideoData = async () => {
// //             try {
// //                 const apiUrl = getApiUrl(`/api/videos/${videoId}`)
// //                 const response = await axios.get(apiUrl)
// //                 setVideoData(response.data)
// //             } catch (err) {
// //                 console.error('Error fetching video data:', err)
// //                 // Don't block video playback if metadata fails
// //             }
// //         }
// //         fetchVideoData()
// //     }, [videoId])

// //     // Initialize HLS
// //     useEffect(() => {
// //         const video = videoRef.current
// //         if (!video) return

// //         const manifestUrl = getManifestUrl(videoId)
// //         setLoading(true)
// //         setError(null)

// //         // Cleanup function
// //         const cleanup = () => {
// //             if (hlsRef.current) {
// //                 hlsRef.current.destroy()
// //                 hlsRef.current = null
// //             }
// //         }

// //         if (Hls.isSupported()) {
// //             const hls = new Hls({
// //                 // ABR Configuration
// //                 abrEwmaDefaultEstimate: 500000,
// //                 abrBandWidthFactor: 0.95,
// //                 abrBandWidthUpFactor: 0.7,
// //                 abrMaxWithRealBitrate: true,

// //                 // Buffer configuration
// //                 maxBufferLength: 30,
// //                 maxMaxBufferLength: 600,
// //                 maxBufferSize: 60 * 1000 * 1000,
// //                 maxBufferHole: 0.1,
// //                 highBufferWatchdogPeriod: 2,
// //                 nudgeOffset: 0.1,
// //                 nudgeMaxRetry: 5,

// //                 // Live sync
// //                 liveSyncDurationCount: 3,

// //                 // Timeouts
// //                 fragLoadingTimeOut: 20000,
// //                 manifestLoadingTimeOut: 10000,
// //                 levelLoadingTimeOut: 10000,
// //             })

// //             hlsRef.current = hls

// //             hls.loadSource(manifestUrl)
// //             hls.attachMedia(video)

// //             hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
// //                 // Helper: Map bitrate to resolution label
// //                 const getResolutionFromBitrate = (bitrate) => {
// //                     if (!bitrate) return 'Unknown'
// //                     const kbps = bitrate / 1000
// //                     if (kbps < 1000) return '360p'
// //                     if (kbps < 2000) return '480p'
// //                     if (kbps < 4000) return '720p'
// //                     if (kbps < 8000) return '1080p'
// //                     return '1440p'
// //                 }

// //                 // Extract qualities
// //                 const availableQualities = [
// //                     { label: 'Auto', value: -1, height: 0, bitrate: 0 },
// //                     ...data.levels.map((level, index) => {
// //                         const height = level.height > 0 ? level.height : 0
// //                         const label = height > 0
// //                             ? `${height}p`
// //                             : getResolutionFromBitrate(level.bitrate)

// //                         return {
// //                             label,
// //                             value: index,
// //                             height,
// //                             bitrate: level.bitrate,
// //                             width: level.width,
// //                         }
// //                     })
// //                 ]

// //                 // Sort qualities (Auto first, then by bitrate)
// //                 const auto = availableQualities[0]
// //                 const sorted = availableQualities.slice(1)
// //                     .sort((a, b) => a.bitrate - b.bitrate)

// //                 setQualities([auto, ...sorted])
// //                 setLoading(false)
// //             })

// //             hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
// //                 setIsSwitchingQuality(false)
// //                 const level = hls.levels[data.level]
// //                 console.log('Quality switched:', level.height > 0 ? `${level.height}p` : `${Math.round(level.bitrate / 1000)} kbps`)
// //             })

// //             hls.on(Hls.Events.FRAG_BUFFERED, () => {
// //                 setIsBuffering(false)
// //             })

// //             hls.on(Hls.Events.ERROR, (event, data) => {
// //                 console.error('HLS error:', data)

// //                 if (data.fatal) {
// //                     switch (data.type) {
// //                         case Hls.ErrorTypes.NETWORK_ERROR:
// //                             console.log('Network error, trying to recover...')
// //                             hls.startLoad()
// //                             break
// //                         case Hls.ErrorTypes.MEDIA_ERROR:
// //                             console.log('Media error, trying to recover...')
// //                             hls.recoverMediaError()
// //                             break
// //                         default:
// //                             console.log('Unrecoverable error')
// //                             setError('Failed to load video. Please try again.')
// //                             cleanup()
// //                             break
// //                     }
// //                 }
// //             })

// //             return cleanup
// //         } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
// //             // Native HLS support (Safari)
// //             video.src = manifestUrl
// //             video.addEventListener('loadedmetadata', () => {
// //                 setLoading(false)
// //             })
// //             video.addEventListener('error', () => {
// //                 setError('Failed to load video')
// //                 setLoading(false)
// //             })
// //         } else {
// //             setError('Your browser does not support video playback')
// //             setLoading(false)
// //         }

// //         return cleanup
// //     }, [videoId])

// //     // Handle quality change
// //     useEffect(() => {
// //         if (!hlsRef.current) return

// //         if (currentQuality === 'Auto') {
// //             hlsRef.current.currentLevel = -1
// //             setIsSwitchingQuality(true)
// //         } else {
// //             const quality = qualities.find(q => q.label === currentQuality)
// //             if (quality && quality.value !== undefined) {
// //                 hlsRef.current.currentLevel = quality.value
// //                 setIsSwitchingQuality(true)
// //             }
// //         }
// //     }, [currentQuality, qualities])

// //     // Video event listeners
// //     useEffect(() => {
// //         const video = videoRef.current
// //         if (!video) return

// //         const handleTimeUpdate = () => {
// //             setCurrentTime(video.currentTime)

// //             // Update buffered
// //             if (video.buffered.length > 0) {
// //                 const bufferedEnd = video.buffered.end(video.buffered.length - 1)
// //                 setBuffered(bufferedEnd)
// //             }
// //         }

// //         const handleDurationChange = () => setDuration(video.duration)
// //         const handlePlay = () => setIsPlaying(true)
// //         const handlePause = () => setIsPlaying(false)
// //         const handleVolumeChange = () => {
// //             setVolume(video.volume)
// //             setIsMuted(video.muted)
// //         }

// //         const handleFullscreenChange = () => {
// //             setIsFullscreen(!!document.fullscreenElement)
// //         }

// //         const handleWaiting = () => setIsBuffering(true)
// //         const handlePlaying = () => {
// //             setIsBuffering(false)
// //             setIsSwitchingQuality(false)
// //         }
// //         const handleCanPlay = () => {
// //             setIsBuffering(false)
// //             setLoading(false)
// //         }

// //         video.addEventListener('timeupdate', handleTimeUpdate)
// //         video.addEventListener('durationchange', handleDurationChange)
// //         video.addEventListener('play', handlePlay)
// //         video.addEventListener('pause', handlePause)
// //         video.addEventListener('volumechange', handleVolumeChange)
// //         video.addEventListener('waiting', handleWaiting)
// //         video.addEventListener('playing', handlePlaying)
// //         video.addEventListener('canplay', handleCanPlay)
// //         document.addEventListener('fullscreenchange', handleFullscreenChange)

// //         return () => {
// //             video.removeEventListener('timeupdate', handleTimeUpdate)
// //             video.removeEventListener('durationchange', handleDurationChange)
// //             video.removeEventListener('play', handlePlay)
// //             video.removeEventListener('pause', handlePause)
// //             video.removeEventListener('volumechange', handleVolumeChange)
// //             video.removeEventListener('waiting', handleWaiting)
// //             video.removeEventListener('playing', handlePlaying)
// //             video.removeEventListener('canplay', handleCanPlay)
// //             document.removeEventListener('fullscreenchange', handleFullscreenChange)
// //         }
// //     }, [])

// //     // Keyboard shortcuts
// //     useEffect(() => {
// //         const handleKeyPress = (e) => {
// //             const video = videoRef.current
// //             if (!video || e.target.tagName === 'INPUT') return

// //             switch (e.key.toLowerCase()) {
// //                 case ' ':
// //                 case 'k':
// //                     e.preventDefault()
// //                     togglePlay()
// //                     break
// //                 case 'arrowleft':
// //                     e.preventDefault()
// //                     video.currentTime = Math.max(0, video.currentTime - 10)
// //                     break
// //                 case 'arrowright':
// //                     e.preventDefault()
// //                     video.currentTime = Math.min(duration, video.currentTime + 10)
// //                     break
// //                 case 'arrowup':
// //                     e.preventDefault()
// //                     video.volume = Math.min(1, video.volume + 0.1)
// //                     break
// //                 case 'arrowdown':
// //                     e.preventDefault()
// //                     video.volume = Math.max(0, video.volume - 0.1)
// //                     break
// //                 case 'f':
// //                     e.preventDefault()
// //                     toggleFullscreen()
// //                     break
// //                 case 'm':
// //                     e.preventDefault()
// //                     toggleMute()
// //                     break
// //             }
// //         }

// //         window.addEventListener('keydown', handleKeyPress)
// //         return () => window.removeEventListener('keydown', handleKeyPress)
// //     }, [duration, isPlaying])

// //     // Auto-hide controls
// //     const handleMouseMove = useCallback(() => {
// //         setShowControls(true)
// //         clearTimeout(controlsTimeoutRef.current)
// //         controlsTimeoutRef.current = setTimeout(() => {
// //             if (isPlaying) setShowControls(false)
// //         }, 3000)
// //     }, [isPlaying])

// //     const handleMouseLeave = useCallback(() => {
// //         if (isPlaying) {
// //             clearTimeout(controlsTimeoutRef.current)
// //             controlsTimeoutRef.current = setTimeout(() => {
// //                 setShowControls(false)
// //             }, 1000)
// //         }
// //     }, [isPlaying])

// //     const togglePlay = useCallback(() => {
// //         const video = videoRef.current
// //         if (!video) return

// //         if (video.paused) {
// //             video.play().catch(err => console.error('Play error:', err))
// //         } else {
// //             video.pause()
// //         }
// //     }, [])

// //     const handleSeek = useCallback((e) => {
// //         const video = videoRef.current
// //         if (!video || !duration) return

// //         const rect = e.currentTarget.getBoundingClientRect()
// //         const pos = (e.clientX - rect.left) / rect.width
// //         const newTime = Math.max(0, Math.min(duration, pos * duration))

// //         video.currentTime = newTime
// //     }, [duration])

// //     const handleVolumeChange = useCallback((e) => {
// //         const video = videoRef.current
// //         if (!video) return

// //         const newVolume = parseFloat(e.target.value)
// //         video.volume = newVolume
// //         video.muted = newVolume === 0
// //         setVolume(newVolume)
// //         setIsMuted(newVolume === 0)
// //     }, [])

// //     const toggleMute = useCallback(() => {
// //         const video = videoRef.current
// //         if (!video) return

// //         video.muted = !video.muted
// //         setIsMuted(video.muted)
// //     }, [])

// //     const toggleFullscreen = useCallback(() => {
// //         const container = containerRef.current
// //         if (!container) return

// //         if (!document.fullscreenElement) {
// //             container.requestFullscreen().catch(err => {
// //                 console.error('Fullscreen error:', err)
// //             })
// //         } else {
// //             document.exitFullscreen()
// //         }
// //     }, [])

// //     const formatTime = (seconds) => {
// //         if (isNaN(seconds)) return '0:00'
// //         const mins = Math.floor(seconds / 60)
// //         const secs = Math.floor(seconds % 60)
// //         return `${mins}:${secs.toString().padStart(2, '0')}`
// //     }

// //     const selectQuality = useCallback((label) => {
// //         setCurrentQuality(label)
// //         setShowQualityMenu(false)
// //     }, [])

// //     const getVolumeIcon = () => {
// //         if (isMuted || volume === 0) {
// //             return (
// //                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
// //                     <line x1="23" y1="9" x2="17" y2="15"></line>
// //                     <line x1="17" y1="9" x2="23" y2="15"></line>
// //                 </svg>
// //             )
// //         } else if (volume < 0.5) {
// //             return (
// //                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
// //                     <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
// //                 </svg>
// //             )
// //         } else {
// //             return (
// //                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
// //                     <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
// //                 </svg>
// //             )
// //         }
// //     }

// //     return (
// //         <div className="video-player-page">
// //             <button className="back-btn" onClick={() => navigate('/')}>
// //                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                     <line x1="19" y1="12" x2="5" y2="12"></line>
// //                     <polyline points="12 19 5 12 12 5"></polyline>
// //                 </svg>
// //                 Back to Browse
// //             </button>

// //             <div
// //                 ref={containerRef}
// //                 className="video-player-container"
// //                 onMouseMove={handleMouseMove}
// //                 onMouseLeave={handleMouseLeave}
// //             >
// //                 {/* Initial Loading */}
// //                 {loading && (
// //                     <div className="loading-overlay">
// //                         <div className="spinner"></div>
// //                         <p>Loading video...</p>
// //                     </div>
// //                 )}

// //                 {/* Error State */}
// //                 {error && (
// //                     <div className="error-overlay">
// //                         <div className="error-icon">⚠️</div>
// //                         <p>{error}</p>
// //                         <button onClick={() => window.location.reload()} className="retry-btn">
// //                             Retry
// //                         </button>
// //                     </div>
// //                 )}

// //                 {/* Quality Switching Loader */}
// //                 {isSwitchingQuality && !loading && (
// //                     <div className="quality-switching-overlay">
// //                         <div className="quality-spinner"></div>
// //                         <p>Switching to {currentQuality}...</p>
// //                     </div>
// //                 )}

// //                 {/* Buffering Indicator */}
// //                 {isBuffering && !loading && !isSwitchingQuality && (
// //                     <div className="buffering-overlay">
// //                         <div className="buffering-spinner"></div>
// //                     </div>
// //                 )}

// //                 <video
// //                     ref={videoRef}
// //                     className={`video-element ${isSwitchingQuality ? 'quality-switching' : ''}`}
// //                     onClick={togglePlay}
// //                     onDoubleClick={toggleFullscreen}
// //                     playsInline
// //                 />

// //                 {/* Custom Controls */}
// //                 <div className={`custom-controls ${showControls ? 'visible' : 'hidden'}`}>
// //                     {/* Progress Bar */}
// //                     <div className="progress-container" onClick={handleSeek}>
// //                         <div className="progress-bar">
// //                             {/* Buffered */}
// //                             <div
// //                                 className="progress-buffered"
// //                                 style={{ width: duration ? `${(buffered / duration) * 100}%` : '0%' }}
// //                             ></div>
// //                             {/* Played */}
// //                             <div
// //                                 className="progress-filled"
// //                                 style={{ width: duration ? `${(currentTime / duration) * 100}%` : '0%' }}
// //                             ></div>
// //                         </div>
// //                     </div>

// //                     <div className="controls-bottom">
// //                         <div className="controls-left">
// //                             <button className="control-btn" onClick={togglePlay}>
// //                                 {isPlaying ? (
// //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
// //                                         <rect x="6" y="4" width="4" height="16"></rect>
// //                                         <rect x="14" y="4" width="4" height="16"></rect>
// //                                     </svg>
// //                                 ) : (
// //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
// //                                         <polygon points="5 3 19 12 5 21 5 3"></polygon>
// //                                     </svg>
// //                                 )}
// //                             </button>

// //                             <div className="volume-control">
// //                                 <button className="control-btn" onClick={toggleMute}>
// //                                     {getVolumeIcon()}
// //                                 </button>
// //                                 <input
// //                                     type="range"
// //                                     min="0"
// //                                     max="1"
// //                                     step="0.05"
// //                                     value={isMuted ? 0 : volume}
// //                                     onChange={handleVolumeChange}
// //                                     className="volume-slider"
// //                                 />
// //                             </div>

// //                             <div className="time-display">
// //                                 <span>{formatTime(currentTime)}</span>
// //                                 <span>/</span>
// //                                 <span>{formatTime(duration)}</span>
// //                             </div>
// //                         </div>

// //                         <div className="controls-right">
// //                             {/* Quality Selector */}
// //                             <div className="quality-selector">
// //                                 <button
// //                                     className="control-btn quality-btn"
// //                                     onClick={() => setShowQualityMenu(!showQualityMenu)}
// //                                 >
// //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                                         <circle cx="12" cy="12" r="3"></circle>
// //                                         <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
// //                                     </svg>
// //                                     <span>{currentQuality}</span>
// //                                 </button>

// //                                 {showQualityMenu && (
// //                                     <div className="quality-menu">
// //                                         {qualities.map((quality) => (
// //                                             <button
// //                                                 key={quality.value}
// //                                                 className={`quality-option ${currentQuality === quality.label ? 'active' : ''}`}
// //                                                 onClick={() => selectQuality(quality.label)}
// //                                             >
// //                                                 <span className="quality-label">
// //                                                     {quality.label}
// //                                                     {currentQuality === quality.label && (
// //                                                         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
// //                                                             <polyline points="20 6 9 17 4 12"></polyline>
// //                                                         </svg>
// //                                                     )}
// //                                                 </span>
// //                                                 {quality.bitrate > 0 && (
// //                                                     <span className="bitrate">
// //                                                         {Math.round(quality.bitrate / 1000)} kbps
// //                                                     </span>
// //                                                 )}
// //                                             </button>
// //                                         ))}
// //                                     </div>
// //                                 )}
// //                             </div>

// //                             <button className="control-btn" onClick={toggleFullscreen}>
// //                                 {isFullscreen ? (
// //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                                         <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
// //                                     </svg>
// //                                 ) : (
// //                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
// //                                         <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
// //                                     </svg>
// //                                 )}
// //                             </button>
// //                         </div>
// //                     </div>
// //                 </div>
// //             </div>

// //             {/* Video Info */}
// //             {videoData && (
// //                 <div className="video-info-section">
// //                     <h1 className="video-title">{videoData.title || 'Untitled Video'}</h1>
// //                     <div className="video-meta">
// //                         <span className="meta-item">{videoData.resolution || '1080p'}</span>
// //                         <span className="meta-separator">•</span>
// //                         <span className="meta-item">{new Date(videoData.createdAt).toLocaleDateString()}</span>
// //                         <span className="meta-separator">•</span>
// //                         <span className="meta-item">{formatTime(videoData.duration)}</span>
// //                     </div>
// //                     <p className="video-description">
// //                         Watch your uploaded video in stunning quality. Stream instantly across all your devices.
// //                     </p>
// //                 </div>
// //             )}
// //         </div>
// //     )
// // }

// // export default VideoPlayer

// import React, { useEffect, useRef, useState, useCallback } from 'react'
// import { useParams, useNavigate } from 'react-router-dom'
// import Hls from 'hls.js'
// import axios from 'axios'
// import { getManifestUrl, getApiUrl } from '../config/env'
// import './VideoPlayer.css'

// function VideoPlayer() {
//     const { videoId } = useParams()
//     const navigate = useNavigate()

//     // Refs
//     const videoRef = useRef(null)
//     const hlsRef = useRef(null)
//     const controlsTimeoutRef = useRef(null)
//     const containerRef = useRef(null)
//     const progressFilledRef = useRef(null)
//     const progressBufferedRef = useRef(null)
//     const currentTimeDisplayRef = useRef(null)

//     // State (only for UI elements that need re-renders)
//     const [qualities, setQualities] = useState([])
//     const [currentQuality, setCurrentQuality] = useState('Auto')
//     const [showQualityMenu, setShowQualityMenu] = useState(false)
//     const [videoData, setVideoData] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const [isPlaying, setIsPlaying] = useState(false)
//     const [duration, setDuration] = useState(0)
//     const [volume, setVolume] = useState(1)
//     const [isMuted, setIsMuted] = useState(false)
//     const [isFullscreen, setIsFullscreen] = useState(false)
//     const [showControls, setShowControls] = useState(true)
//     const [isSwitchingQuality, setIsSwitchingQuality] = useState(false)
//     const [isBuffering, setIsBuffering] = useState(false)

//     // Fetch video metadata
//     useEffect(() => {
//         const fetchVideoData = async () => {
//             try {
//                 const apiUrl = getApiUrl(`/api/videos/${videoId}`)
//                 const response = await axios.get(apiUrl)
//                 setVideoData(response.data)
//             } catch (err) {
//                 console.error('Error fetching video data:', err)
//             }
//         }
//         fetchVideoData()
//     }, [videoId])

//     // Initialize HLS
//     useEffect(() => {
//         const video = videoRef.current
//         if (!video) return

//         const manifestUrl = getManifestUrl(videoId)
//         setLoading(true)
//         setError(null)

//         const cleanup = () => {
//             if (hlsRef.current) {
//                 hlsRef.current.destroy()
//                 hlsRef.current = null
//             }
//         }

//         if (Hls.isSupported()) {
//             const hls = new Hls({
//                 abrEwmaDefaultEstimate: 500000,
//                 abrBandWidthFactor: 0.95,
//                 abrBandWidthUpFactor: 0.7,
//                 abrMaxWithRealBitrate: true,
//                 maxBufferLength: 30,
//                 maxMaxBufferLength: 600,
//                 maxBufferSize: 60 * 1000 * 1000,
//                 maxBufferHole: 0.1,
//                 highBufferWatchdogPeriod: 2,
//                 nudgeOffset: 0.1,
//                 nudgeMaxRetry: 5,
//                 liveSyncDurationCount: 3,
//                 fragLoadingTimeOut: 20000,
//                 manifestLoadingTimeOut: 10000,
//                 levelLoadingTimeOut: 10000,
//             })

//             hlsRef.current = hls
//             hls.loadSource(manifestUrl)
//             hls.attachMedia(video)

//             hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
//                 const getResolutionFromBitrate = (bitrate) => {
//                     if (!bitrate) return 'Unknown'
//                     const kbps = bitrate / 1000
//                     if (kbps < 1000) return '360p'
//                     if (kbps < 2000) return '480p'
//                     if (kbps < 4000) return '720p'
//                     if (kbps < 8000) return '1080p'
//                     return '1440p'
//                 }

//                 const availableQualities = [
//                     { label: 'Auto', value: -1, height: 0, bitrate: 0 },
//                     ...data.levels.map((level, index) => {
//                         const height = level.height > 0 ? level.height : 0
//                         const label = height > 0
//                             ? `${height}p`
//                             : getResolutionFromBitrate(level.bitrate)

//                         return {
//                             label,
//                             value: index,
//                             height,
//                             bitrate: level.bitrate,
//                             width: level.width,
//                         }
//                     })
//                 ]

//                 const auto = availableQualities[0]
//                 const sorted = availableQualities.slice(1)
//                     .sort((a, b) => a.bitrate - b.bitrate)

//                 setQualities([auto, ...sorted])
//                 setLoading(false)
//             })

//             hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
//                 setIsSwitchingQuality(false)
//             })

//             hls.on(Hls.Events.ERROR, (event, data) => {
//                 if (data.fatal) {
//                     switch (data.type) {
//                         case Hls.ErrorTypes.NETWORK_ERROR:
//                             hls.startLoad()
//                             break
//                         case Hls.ErrorTypes.MEDIA_ERROR:
//                             hls.recoverMediaError()
//                             break
//                         default:
//                             setError('Failed to load video. Please try again.')
//                             cleanup()
//                             break
//                     }
//                 }
//             })

//             return cleanup
//         } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
//             video.src = manifestUrl
//             video.addEventListener('loadedmetadata', () => setLoading(false))
//             video.addEventListener('error', () => {
//                 setError('Failed to load video')
//                 setLoading(false)
//             })
//         } else {
//             setError('Your browser does not support video playback')
//             setLoading(false)
//         }

//         return cleanup
//     }, [videoId])

//     // Handle quality change
//     useEffect(() => {
//         if (!hlsRef.current) return

//         if (currentQuality === 'Auto') {
//             hlsRef.current.currentLevel = -1
//             setIsSwitchingQuality(true)
//         } else {
//             const quality = qualities.find(q => q.label === currentQuality)
//             if (quality && quality.value !== undefined) {
//                 hlsRef.current.currentLevel = quality.value
//                 setIsSwitchingQuality(true)
//             }
//         }
//     }, [currentQuality, qualities])

//     // Video event listeners - DIRECT DOM MANIPULATION
//     useEffect(() => {
//         const video = videoRef.current
//         if (!video) return

//         // Helper to format time
//         const formatTime = (seconds) => {
//             if (isNaN(seconds)) return '0:00'
//             const mins = Math.floor(seconds / 60)
//             const secs = Math.floor(seconds % 60)
//             return `${mins}:${secs.toString().padStart(2, '0')}`
//         }

//         // Direct DOM updates (no state, no re-renders)
//         const handleTimeUpdate = () => {
//             if (progressFilledRef.current && video.duration) {
//                 const percent = (video.currentTime / video.duration) * 100
//                 progressFilledRef.current.style.width = `${percent}%`
//             }

//             if (currentTimeDisplayRef.current) {
//                 currentTimeDisplayRef.current.textContent = formatTime(video.currentTime)
//             }

//             // Update buffered
//             if (progressBufferedRef.current && video.buffered.length > 0) {
//                 const bufferedEnd = video.buffered.end(video.buffered.length - 1)
//                 const bufferedPercent = (bufferedEnd / video.duration) * 100
//                 progressBufferedRef.current.style.width = `${bufferedPercent}%`
//             }
//         }

//         const handleDurationChange = () => {
//             setDuration(video.duration)
//         }

//         const handlePlay = () => setIsPlaying(true)
//         const handlePause = () => setIsPlaying(false)

//         const handleVolumeChange = () => {
//             setVolume(video.volume)
//             setIsMuted(video.muted)
//         }

//         const handleFullscreenChange = () => {
//             setIsFullscreen(!!document.fullscreenElement)
//         }

//         const handleWaiting = () => setIsBuffering(true)
//         const handlePlaying = () => {
//             setIsBuffering(false)
//             setIsSwitchingQuality(false)
//         }
//         const handleCanPlay = () => {
//             setIsBuffering(false)
//             setLoading(false)
//         }

//         video.addEventListener('timeupdate', handleTimeUpdate)
//         video.addEventListener('durationchange', handleDurationChange)
//         video.addEventListener('play', handlePlay)
//         video.addEventListener('pause', handlePause)
//         video.addEventListener('volumechange', handleVolumeChange)
//         video.addEventListener('waiting', handleWaiting)
//         video.addEventListener('playing', handlePlaying)
//         video.addEventListener('canplay', handleCanPlay)
//         document.addEventListener('fullscreenchange', handleFullscreenChange)

//         return () => {
//             video.removeEventListener('timeupdate', handleTimeUpdate)
//             video.removeEventListener('durationchange', handleDurationChange)
//             video.removeEventListener('play', handlePlay)
//             video.removeEventListener('pause', handlePause)
//             video.removeEventListener('volumechange', handleVolumeChange)
//             video.removeEventListener('waiting', handleWaiting)
//             video.removeEventListener('playing', handlePlaying)
//             video.removeEventListener('canplay', handleCanPlay)
//             document.removeEventListener('fullscreenchange', handleFullscreenChange)
//         }
//     }, [])

//     // Keyboard shortcuts
//     useEffect(() => {
//         const handleKeyPress = (e) => {
//             const video = videoRef.current
//             if (!video || e.target.tagName === 'INPUT') return

//             switch (e.key.toLowerCase()) {
//                 case ' ':
//                 case 'k':
//                     e.preventDefault()
//                     togglePlay()
//                     break
//                 case 'arrowleft':
//                     e.preventDefault()
//                     video.currentTime = Math.max(0, video.currentTime - 10)
//                     break
//                 case 'arrowright':
//                     e.preventDefault()
//                     video.currentTime = Math.min(duration, video.currentTime + 10)
//                     break
//                 case 'arrowup':
//                     e.preventDefault()
//                     video.volume = Math.min(1, video.volume + 0.1)
//                     break
//                 case 'arrowdown':
//                     e.preventDefault()
//                     video.volume = Math.max(0, video.volume - 0.1)
//                     break
//                 case 'f':
//                     e.preventDefault()
//                     toggleFullscreen()
//                     break
//                 case 'm':
//                     e.preventDefault()
//                     toggleMute()
//                     break
//             }
//         }

//         window.addEventListener('keydown', handleKeyPress)
//         return () => window.removeEventListener('keydown', handleKeyPress)
//     }, [duration])

//     // Auto-hide controls
//     const handleMouseMove = useCallback(() => {
//         setShowControls(true)
//         clearTimeout(controlsTimeoutRef.current)
//         controlsTimeoutRef.current = setTimeout(() => {
//             if (isPlaying) setShowControls(false)
//         }, 3000)
//     }, [isPlaying])

//     const handleMouseLeave = useCallback(() => {
//         if (isPlaying) {
//             clearTimeout(controlsTimeoutRef.current)
//             controlsTimeoutRef.current = setTimeout(() => {
//                 setShowControls(false)
//             }, 1000)
//         }
//     }, [isPlaying])

//     const togglePlay = useCallback(() => {
//         const video = videoRef.current
//         if (!video) return

//         if (video.paused) {
//             video.play().catch(err => console.error('Play error:', err))
//         } else {
//             video.pause()
//         }
//     }, [])

//     const handleSeek = useCallback((e) => {
//         const video = videoRef.current
//         if (!video || !duration) return

//         const rect = e.currentTarget.getBoundingClientRect()
//         const pos = (e.clientX - rect.left) / rect.width
//         const newTime = Math.max(0, Math.min(duration, pos * duration))

//         video.currentTime = newTime
//     }, [duration])

//     const handleVolumeChange = useCallback((e) => {
//         const video = videoRef.current
//         if (!video) return

//         const newVolume = parseFloat(e.target.value)
//         video.volume = newVolume
//         video.muted = newVolume === 0
//     }, [])

//     const toggleMute = useCallback(() => {
//         const video = videoRef.current
//         if (!video) return

//         video.muted = !video.muted
//     }, [])

//     const toggleFullscreen = useCallback(() => {
//         const container = containerRef.current
//         if (!container) return

//         if (!document.fullscreenElement) {
//             container.requestFullscreen().catch(err => {
//                 console.error('Fullscreen error:', err)
//             })
//         } else {
//             document.exitFullscreen()
//         }
//     }, [])

//     const formatTime = (seconds) => {
//         if (isNaN(seconds)) return '0:00'
//         const mins = Math.floor(seconds / 60)
//         const secs = Math.floor(seconds % 60)
//         return `${mins}:${secs.toString().padStart(2, '0')}`
//     }

//     const selectQuality = useCallback((label) => {
//         setCurrentQuality(label)
//         setShowQualityMenu(false)
//     }, [])

//     const getVolumeIcon = () => {
//         if (isMuted || volume === 0) {
//             return (
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
//                     <line x1="23" y1="9" x2="17" y2="15"></line>
//                     <line x1="17" y1="9" x2="23" y2="15"></line>
//                 </svg>
//             )
//         } else if (volume < 0.5) {
//             return (
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
//                     <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
//                 </svg>
//             )
//         } else {
//             return (
//                 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
//                     <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
//                 </svg>
//             )
//         }
//     }

//     return (
//         <div className="video-player-page">
//             <button className="back-btn" onClick={() => navigate('/')}>
//                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                     <line x1="19" y1="12" x2="5" y2="12"></line>
//                     <polyline points="12 19 5 12 12 5"></polyline>
//                 </svg>
//                 Back to Browse
//             </button>

//             <div
//                 ref={containerRef}
//                 className="video-player-container"
//                 onMouseMove={handleMouseMove}
//                 onMouseLeave={handleMouseLeave}
//             >
//                 {loading && (
//                     <div className="loading-overlay">
//                         <div className="spinner"></div>
//                         <p>Loading video...</p>
//                     </div>
//                 )}

//                 {error && (
//                     <div className="error-overlay">
//                         <div className="error-icon">⚠️</div>
//                         <p>{error}</p>
//                         <button onClick={() => window.location.reload()} className="retry-btn">
//                             Retry
//                         </button>
//                     </div>
//                 )}

//                 {isSwitchingQuality && !loading && (
//                     <div className="quality-switching-overlay">
//                         <div className="quality-spinner"></div>
//                         <p>Switching to {currentQuality}...</p>
//                     </div>
//                 )}

//                 {isBuffering && !loading && !isSwitchingQuality && (
//                     <div className="buffering-overlay">
//                         <div className="buffering-spinner"></div>
//                     </div>
//                 )}

//                 <video
//                     ref={videoRef}
//                     className={`video-element ${isSwitchingQuality ? 'quality-switching' : ''}`}
//                     onClick={togglePlay}
//                     onDoubleClick={toggleFullscreen}
//                     playsInline
//                 />

//                 <div className={`custom-controls ${showControls ? 'visible' : 'hidden'}`}>
//                     <div className="progress-container" onClick={handleSeek}>
//                         <div className="progress-bar">
//                             <div
//                                 ref={progressBufferedRef}
//                                 className="progress-buffered"
//                             ></div>
//                             <div
//                                 ref={progressFilledRef}
//                                 className="progress-filled"
//                             ></div>
//                         </div>
//                     </div>

//                     <div className="controls-bottom">
//                         <div className="controls-left">
//                             <button className="control-btn" onClick={togglePlay}>
//                                 {isPlaying ? (
//                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                                         <rect x="6" y="4" width="4" height="16"></rect>
//                                         <rect x="14" y="4" width="4" height="16"></rect>
//                                     </svg>
//                                 ) : (
//                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
//                                         <polygon points="5 3 19 12 5 21 5 3"></polygon>
//                                     </svg>
//                                 )}
//                             </button>

//                             <div className="volume-control">
//                                 <button className="control-btn" onClick={toggleMute}>
//                                     {getVolumeIcon()}
//                                 </button>
//                                 <input
//                                     type="range"
//                                     min="0"
//                                     max="1"
//                                     step="0.05"
//                                     value={isMuted ? 0 : volume}
//                                     onChange={handleVolumeChange}
//                                     className="volume-slider"
//                                 />
//                             </div>

//                             <div className="time-display">
//                                 <span ref={currentTimeDisplayRef}>0:00</span>
//                                 <span>/</span>
//                                 <span>{formatTime(duration)}</span>
//                             </div>
//                         </div>

//                         <div className="controls-right">
//                             <div className="quality-selector">
//                                 <button
//                                     className="control-btn quality-btn"
//                                     onClick={() => setShowQualityMenu(!showQualityMenu)}
//                                 >
//                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                         <circle cx="12" cy="12" r="3"></circle>
//                                         <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
//                                     </svg>
//                                     <span>{currentQuality}</span>
//                                 </button>

//                                 {showQualityMenu && (
//                                     <div className="quality-menu">
//                                         {qualities.map((quality) => (
//                                             <button
//                                                 key={quality.value}
//                                                 className={`quality-option ${currentQuality === quality.label ? 'active' : ''}`}
//                                                 onClick={() => selectQuality(quality.label)}
//                                             >
//                                                 <span className="quality-label">
//                                                     {quality.label}
//                                                     {currentQuality === quality.label && (
//                                                         <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
//                                                             <polyline points="20 6 9 17 4 12"></polyline>
//                                                         </svg>
//                                                     )}
//                                                 </span>
//                                                 {quality.bitrate > 0 && (
//                                                     <span className="bitrate">
//                                                         {Math.round(quality.bitrate / 1000)} kbps
//                                                     </span>
//                                                 )}
//                                             </button>
//                                         ))}
//                                     </div>
//                                 )}
//                             </div>

//                             <button className="control-btn" onClick={toggleFullscreen}>
//                                 {isFullscreen ? (
//                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                         <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
//                                     </svg>
//                                 ) : (
//                                     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                         <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
//                                     </svg>
//                                 )}
//                             </button>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {videoData && (
//                 <div className="video-info-section">
//                     <h1 className="video-title">{videoData.title || 'Untitled Video'}</h1>
//                     <div className="video-meta">
//                         <span className="meta-item">{videoData.resolution || '1080p'}</span>
//                         <span className="meta-separator">•</span>
//                         <span className="meta-item">{new Date(videoData.createdAt).toLocaleDateString()}</span>
//                         <span className="meta-separator">•</span>
//                         <span className="meta-item">{formatTime(videoData.duration)}</span>
//                     </div>
//                     <p className="video-description">
//                         Watch your uploaded video in stunning quality. Stream instantly across all your devices.
//                     </p>
//                 </div>
//             )}
//         </div>
//     )
// }

// export default VideoPlayer

import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Hls from 'hls.js'
import axios from 'axios'
import { getManifestUrl, getApiUrl } from '../config/env'
import './VideoPlayer.css'

function VideoPlayer() {
    const { videoId } = useParams()
    const navigate = useNavigate()

    // Refs
    const videoRef = useRef(null)
    const hlsRef = useRef(null)
    const controlsTimeoutRef = useRef(null)
    const containerRef = useRef(null)
    const progressFilledRef = useRef(null)
    const progressBufferedRef = useRef(null)
    const currentTimeDisplayRef = useRef(null)
    const isPausedByUserRef = useRef(false) // Track if user explicitly paused

    // State
    const [qualities, setQualities] = useState([])
    const [currentQuality, setCurrentQuality] = useState('Auto')
    const [showQualityMenu, setShowQualityMenu] = useState(false)
    const [videoData, setVideoData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [duration, setDuration] = useState(0)
    const [volume, setVolume] = useState(1)
    const [isMuted, setIsMuted] = useState(false)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isSwitchingQuality, setIsSwitchingQuality] = useState(false)
    const [isBuffering, setIsBuffering] = useState(false)

    // Fetch video metadata
    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                const apiUrl = getApiUrl(`/api/videos/${videoId}`)
                const response = await axios.get(apiUrl)
                setVideoData(response.data)
            } catch (err) {
                console.error('Error fetching video data:', err)
            }
        }
        fetchVideoData()
    }, [videoId])

    // Initialize HLS
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const manifestUrl = getManifestUrl(videoId)
        setLoading(true)
        setError(null)

        const cleanup = () => {
            if (hlsRef.current) {
                hlsRef.current.destroy()
                hlsRef.current = null
            }
        }

        if (Hls.isSupported()) {
            const hls = new Hls({
                abrEwmaDefaultEstimate: 500000,
                abrBandWidthFactor: 0.95,
                abrBandWidthUpFactor: 0.7,
                abrMaxWithRealBitrate: true,
                maxBufferLength: 30,
                maxMaxBufferLength: 600,
                maxBufferSize: 60 * 1000 * 1000,

                // ✅ FIXED: Disable aggressive buffer nudging
                maxBufferHole: 0.5, // Increased from 0.1
                highBufferWatchdogPeriod: 0, // DISABLED: Don't auto-resume
                nudgeOffset: 0.1,
                nudgeMaxRetry: 0, // DISABLED: Don't nudge when paused

                liveSyncDurationCount: 3,
                fragLoadingTimeOut: 20000,
                manifestLoadingTimeOut: 10000,
                levelLoadingTimeOut: 10000,
            })

            hlsRef.current = hls
            hls.loadSource(manifestUrl)
            hls.attachMedia(video)

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const getResolutionFromBitrate = (bitrate) => {
                    if (!bitrate) return 'Unknown'
                    const kbps = bitrate / 1000
                    if (kbps < 1000) return '360p'
                    if (kbps < 2000) return '480p'
                    if (kbps < 4000) return '720p'
                    if (kbps < 8000) return '1080p'
                    return '1440p'
                }

                const availableQualities = [
                    { label: 'Auto', value: -1, height: 0, bitrate: 0 },
                    ...data.levels.map((level, index) => {
                        const height = level.height > 0 ? level.height : 0
                        const label = height > 0
                            ? `${height}p`
                            : getResolutionFromBitrate(level.bitrate)

                        return {
                            label,
                            value: index,
                            height,
                            bitrate: level.bitrate,
                            width: level.width,
                        }
                    })
                ]

                const auto = availableQualities[0]
                const sorted = availableQualities.slice(1)
                    .sort((a, b) => a.bitrate - b.bitrate)

                setQualities([auto, ...sorted])
                setLoading(false)
            })

            hls.on(Hls.Events.LEVEL_SWITCHED, () => {
                setIsSwitchingQuality(false)
            })

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad()
                            break
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError()
                            break
                        default:
                            setError('Failed to load video. Please try again.')
                            cleanup()
                            break
                    }
                }
            })

            return cleanup
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = manifestUrl
            video.addEventListener('loadedmetadata', () => setLoading(false))
            video.addEventListener('error', () => {
                setError('Failed to load video')
                setLoading(false)
            })
        } else {
            setError('Your browser does not support video playback')
            setLoading(false)
        }

        return cleanup
    }, [videoId])

    // Handle quality change
    useEffect(() => {
        if (!hlsRef.current) return

        if (currentQuality === 'Auto') {
            hlsRef.current.currentLevel = -1
            setIsSwitchingQuality(true)
        } else {
            const quality = qualities.find(q => q.label === currentQuality)
            if (quality && quality.value !== undefined) {
                hlsRef.current.currentLevel = quality.value
                setIsSwitchingQuality(true)
            }
        }
    }, [currentQuality, qualities])

    // Video event listeners - DIRECT DOM MANIPULATION
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const formatTime = (seconds) => {
            if (isNaN(seconds)) return '0:00'
            const mins = Math.floor(seconds / 60)
            const secs = Math.floor(seconds % 60)
            return `${mins}:${secs.toString().padStart(2, '0')}`
        }

        // ✅ FIXED: Only update progress if video is playing
        const handleTimeUpdate = () => {
            // Don't update progress if paused by user
            if (isPausedByUserRef.current && video.paused) {
                return
            }

            if (progressFilledRef.current && video.duration) {
                const percent = (video.currentTime / video.duration) * 100
                progressFilledRef.current.style.width = `${percent}%`
            }

            if (currentTimeDisplayRef.current) {
                currentTimeDisplayRef.current.textContent = formatTime(video.currentTime)
            }

            if (progressBufferedRef.current && video.buffered.length > 0) {
                const bufferedEnd = video.buffered.end(video.buffered.length - 1)
                const bufferedPercent = (bufferedEnd / video.duration) * 100
                progressBufferedRef.current.style.width = `${bufferedPercent}%`
            }
        }

        const handleDurationChange = () => {
            setDuration(video.duration)
        }

        const handlePlay = () => {
            isPausedByUserRef.current = false
            setIsPlaying(true)
        }

        const handlePause = () => {
            isPausedByUserRef.current = true
            setIsPlaying(false)
        }

        const handleVolumeChange = () => {
            setVolume(video.volume)
            setIsMuted(video.muted)
        }

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }

        // ✅ FIXED: Prevent buffering state from affecting pause
        const handleWaiting = () => {
            if (!isPausedByUserRef.current) {
                setIsBuffering(true)
            }
        }

        const handlePlaying = () => {
            if (!isPausedByUserRef.current) {
                setIsBuffering(false)
                setIsSwitchingQuality(false)
            }
        }

        const handleCanPlay = () => {
            if (!isPausedByUserRef.current) {
                setIsBuffering(false)
                setLoading(false)
            }
        }

        // ✅ CRITICAL: Prevent auto-play when paused
        const preventAutoPlay = () => {
            if (isPausedByUserRef.current && !video.paused) {
                video.pause()
            }
        }

        video.addEventListener('timeupdate', handleTimeUpdate)
        video.addEventListener('durationchange', handleDurationChange)
        video.addEventListener('play', handlePlay)
        video.addEventListener('pause', handlePause)
        video.addEventListener('volumechange', handleVolumeChange)
        video.addEventListener('waiting', handleWaiting)
        video.addEventListener('playing', handlePlaying)
        video.addEventListener('canplay', handleCanPlay)
        video.addEventListener('play', preventAutoPlay) // Prevent auto-play
        document.addEventListener('fullscreenchange', handleFullscreenChange)

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate)
            video.removeEventListener('durationchange', handleDurationChange)
            video.removeEventListener('play', handlePlay)
            video.removeEventListener('pause', handlePause)
            video.removeEventListener('volumechange', handleVolumeChange)
            video.removeEventListener('waiting', handleWaiting)
            video.removeEventListener('playing', handlePlaying)
            video.removeEventListener('canplay', handleCanPlay)
            video.removeEventListener('play', preventAutoPlay)
            document.removeEventListener('fullscreenchange', handleFullscreenChange)
        }
    }, [])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e) => {
            const video = videoRef.current
            if (!video || e.target.tagName === 'INPUT') return

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault()
                    togglePlay()
                    break
                case 'arrowleft':
                    e.preventDefault()
                    video.currentTime = Math.max(0, video.currentTime - 10)
                    break
                case 'arrowright':
                    e.preventDefault()
                    video.currentTime = Math.min(duration, video.currentTime + 10)
                    break
                case 'arrowup':
                    e.preventDefault()
                    video.volume = Math.min(1, video.volume + 0.1)
                    break
                case 'arrowdown':
                    e.preventDefault()
                    video.volume = Math.max(0, video.volume - 0.1)
                    break
                case 'f':
                    e.preventDefault()
                    toggleFullscreen()
                    break
                case 'm':
                    e.preventDefault()
                    toggleMute()
                    break
            }
        }

        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [duration])

    // Auto-hide controls
    const handleMouseMove = useCallback(() => {
        setShowControls(true)
        clearTimeout(controlsTimeoutRef.current)
        controlsTimeoutRef.current = setTimeout(() => {
            if (isPlaying) setShowControls(false)
        }, 3000)
    }, [isPlaying])

    const handleMouseLeave = useCallback(() => {
        if (isPlaying) {
            clearTimeout(controlsTimeoutRef.current)
            controlsTimeoutRef.current = setTimeout(() => {
                setShowControls(false)
            }, 1000)
        }
    }, [isPlaying])

    const togglePlay = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        if (video.paused) {
            isPausedByUserRef.current = false
            video.play().catch(err => console.error('Play error:', err))
        } else {
            isPausedByUserRef.current = true
            video.pause()
        }
    }, [])

    const handleSeek = useCallback((e) => {
        const video = videoRef.current
        if (!video || !duration) return

        const rect = e.currentTarget.getBoundingClientRect()
        const pos = (e.clientX - rect.left) / rect.width
        const newTime = Math.max(0, Math.min(duration, pos * duration))

        video.currentTime = newTime

        // Update progress immediately after seek
        if (progressFilledRef.current) {
            const percent = (newTime / duration) * 100
            progressFilledRef.current.style.width = `${percent}%`
        }
        if (currentTimeDisplayRef.current) {
            const formatTime = (seconds) => {
                const mins = Math.floor(seconds / 60)
                const secs = Math.floor(seconds % 60)
                return `${mins}:${secs.toString().padStart(2, '0')}`
            }
            currentTimeDisplayRef.current.textContent = formatTime(newTime)
        }
    }, [duration])

    const handleVolumeChange = useCallback((e) => {
        const video = videoRef.current
        if (!video) return

        const newVolume = parseFloat(e.target.value)
        video.volume = newVolume
        video.muted = newVolume === 0
    }, [])

    const toggleMute = useCallback(() => {
        const video = videoRef.current
        if (!video) return

        video.muted = !video.muted
    }, [])

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current
        if (!container) return

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => {
                console.error('Fullscreen error:', err)
            })
        } else {
            document.exitFullscreen()
        }
    }, [])

    const formatTime = (seconds) => {
        if (isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const selectQuality = useCallback((label) => {
        setCurrentQuality(label)
        setShowQualityMenu(false)
    }, [])

    const getVolumeIcon = () => {
        if (isMuted || volume === 0) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <line x1="23" y1="9" x2="17" y2="15"></line>
                    <line x1="17" y1="9" x2="23" y2="15"></line>
                </svg>
            )
        } else if (volume < 0.5) {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            )
        } else {
            return (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
            )
        }
    }

    return (
        <div className="video-player-page">
            <button className="back-btn" onClick={() => navigate('/')}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"></line>
                    <polyline points="12 19 5 12 12 5"></polyline>
                </svg>
                Back to Browse
            </button>

            <div
                ref={containerRef}
                className="video-player-container"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {loading && (
                    <div className="loading-overlay">
                        <div className="spinner"></div>
                        <p>Loading video...</p>
                    </div>
                )}

                {error && (
                    <div className="error-overlay">
                        <div className="error-icon">⚠️</div>
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="retry-btn">
                            Retry
                        </button>
                    </div>
                )}

                {isSwitchingQuality && !loading && (
                    <div className="quality-switching-overlay">
                        <div className="quality-spinner"></div>
                        <p>Switching to {currentQuality}...</p>
                    </div>
                )}

                {isBuffering && !loading && !isSwitchingQuality && (
                    <div className="buffering-overlay">
                        <div className="buffering-spinner"></div>
                    </div>
                )}

                <video
                    ref={videoRef}
                    className={`video-element ${isSwitchingQuality ? 'quality-switching' : ''}`}
                    onClick={togglePlay}
                    onDoubleClick={toggleFullscreen}
                    playsInline
                />

                <div className={`custom-controls ${showControls ? 'visible' : 'hidden'}`}>
                    <div className="progress-container" onClick={handleSeek}>
                        <div className="progress-bar">
                            <div
                                ref={progressBufferedRef}
                                className="progress-buffered"
                            ></div>
                            <div
                                ref={progressFilledRef}
                                className="progress-filled"
                            ></div>
                        </div>
                    </div>

                    <div className="controls-bottom">
                        <div className="controls-left">
                            <button className="control-btn" onClick={togglePlay}>
                                {isPlaying ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <rect x="6" y="4" width="4" height="16"></rect>
                                        <rect x="14" y="4" width="4" height="16"></rect>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                        <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                    </svg>
                                )}
                            </button>

                            <div className="volume-control">
                                <button className="control-btn" onClick={toggleMute}>
                                    {getVolumeIcon()}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={handleVolumeChange}
                                    className="volume-slider"
                                />
                            </div>

                            <div className="time-display">
                                <span ref={currentTimeDisplayRef}>0:00</span>
                                <span>/</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        <div className="controls-right">
                            <div className="quality-selector">
                                <button
                                    className="control-btn quality-btn"
                                    onClick={() => setShowQualityMenu(!showQualityMenu)}
                                >
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                                    </svg>
                                    <span>{currentQuality}</span>
                                </button>

                                {showQualityMenu && (
                                    <div className="quality-menu">
                                        {qualities.map((quality) => (
                                            <button
                                                key={quality.value}
                                                className={`quality-option ${currentQuality === quality.label ? 'active' : ''}`}
                                                onClick={() => selectQuality(quality.label)}
                                            >
                                                <span className="quality-label">
                                                    {quality.label}
                                                    {currentQuality === quality.label && (
                                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                                            <polyline points="20 6 9 17 4 12"></polyline>
                                                        </svg>
                                                    )}
                                                </span>
                                                {quality.bitrate > 0 && (
                                                    <span className="bitrate">
                                                        {Math.round(quality.bitrate / 1000)} kbps
                                                    </span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button className="control-btn" onClick={toggleFullscreen}>
                                {isFullscreen ? (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                                    </svg>
                                ) : (
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {videoData && (
                <div className="video-info-section">
                    <h1 className="video-title">{videoData.title || 'Untitled Video'}</h1>
                    <div className="video-meta">
                        <span className="meta-item">{videoData.resolution || '1080p'}</span>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">{new Date(videoData.createdAt).toLocaleDateString()}</span>
                        <span className="meta-separator">•</span>
                        <span className="meta-item">{formatTime(videoData.duration)}</span>
                    </div>
                    <p className="video-description">
                        Watch your uploaded video in stunning quality. Stream instantly across all your devices.
                    </p>
                </div>
            )}
        </div>
    )
}

export default VideoPlayer