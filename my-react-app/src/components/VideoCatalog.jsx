import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // Add this import
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { getApiUrl, getThumbnailUrl, getManifestUrl } from '../config/env';
import './VideoCatalog.css';

function HoverInfoPortal({ children, targetRef, isOpen }) {
    const [style, setStyle] = useState({});

    useEffect(() => {
        if (isOpen && targetRef.current) {
            const rect = targetRef.current.getBoundingClientRect();
            setStyle({
                position: 'absolute',
                top: `${rect.bottom + window.scrollY}px`,
                left: `${rect.left + window.scrollX}px`,
                width: `${rect.width}px`,
                zIndex: 1000,
                pointerEvents: 'auto'
            });
        }
    }, [isOpen, targetRef]);

    if (!isOpen) return null;
    return createPortal(<div style={style}>{children}</div>, document.body);
}

function VideoCatalog() {
    const [videos, setVideos] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [heroVideo, setHeroVideo] = useState(null)
    const navigate = useNavigate()

    useEffect(() => {
        loadVideos()
    }, [])

    const loadVideos = async () => {
        try {
            setLoading(true)
            setError(null)

            const apiUrl = getApiUrl('/api/videos')
            const response = await axios.get(apiUrl, { timeout: 30000 })

            const transformedVideos = response.data.map(video => ({
                ...video,
                thumbnail: getThumbnailUrl(video.videoId),
                manifestUrl: getManifestUrl(video.videoId),
            }))

            setVideos(transformedVideos)
            if (transformedVideos.length > 0) {
                setHeroVideo(transformedVideos[0])
            }
        } catch (err) {
            console.error('Error loading videos:', err)
            setError(err.message || 'Failed to load videos')
        } finally {
            setLoading(false)
        }
    }

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}m ${secs}s`
    }

    const formatDurationShort = (seconds) => {
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading) {
        return (
            <div className="netflix-loading">
                <div className="netflix-spinner"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="error-container">
                <h2>⚠️ Error</h2>
                <p>{error}</p>
                <button onClick={loadVideos}>Try Again</button>
            </div>
        )
    }

    return (
        <div className="netflix-catalog">
            {heroVideo && <HeroSection video={heroVideo} navigate={navigate} />}

            <div className="content-rows">
                <VideoRow
                    title="🔥 Trending Now"
                    videos={videos}
                    formatDuration={formatDurationShort}
                    navigate={navigate}
                />

                {videos.length > 1 && (
                    <VideoRow
                        title="✨ Recently Added"
                        videos={[...videos].reverse()}
                        formatDuration={formatDurationShort}
                        navigate={navigate}
                    />
                )}
            </div>
        </div>
    )
}

function HeroSection({ video, navigate }) {
    return (
        <div className="hero-section">
            <div className="hero-backdrop">
                <img src={video.thumbnail} alt={video.title} />
                <div className="hero-gradient"></div>
            </div>

            <div className="hero-content">
                <div className="hero-badge">NEW RELEASE</div>
                <h1 className="hero-title">{video.title}</h1>
                <div className="hero-meta">
                    <span className="match">98% Match</span>
                    <span className="year">{new Date(video.createdAt).getFullYear()}</span>
                    <span className="rating">HD</span>
                    <span className="duration">{Math.floor(video.duration / 60)}m {video.duration % 60}s</span>
                </div>
                <p className="hero-description">
                    Watch your uploaded video in stunning quality. Stream instantly across all your devices.
                </p>
                <div className="hero-buttons">
                    <button className="play-btn" onClick={() => navigate(`/watch/${video.videoId}`)}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <polygon points="5 3 19 12 5 21 5 3"></polygon>
                        </svg>
                        Play
                    </button>
                    <button className="info-btn">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="12" y1="16" x2="12" y2="12"></line>
                            <line x1="12" y1="8" x2="12.01" y2="8"></line>
                        </svg>
                        More Info
                    </button>
                </div>
            </div>
        </div>
    )
}

// function VideoRow({ title, videos, formatDuration, navigate }) {
//     const rowRef = useRef(null)
//     const [hoveredVideo, setHoveredVideo] = useState(null)
//     const [hoveredCardIndex, setHoveredCardIndex] = useState(0)

//     const scroll = (direction) => {
//         if (rowRef.current) {
//             const scrollAmount = direction === 'left' ? -800 : 800
//             rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' })
//         }
//     }

//     if (videos.length === 0) return null

//     return (
//         <div className="video-row">
//             <h2 className="row-title">{title}</h2>

//             <div className="row-wrapper">
//                 <button className="row-arrow left-arrow" onClick={() => scroll('left')}>
//                     <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
//                         <polygon points="15 18 9 12 15 6"></polygon>
//                     </svg>
//                 </button>

//                 <div className="row-content" ref={rowRef}>
//                     {videos.map((video, index) => (
//                         <VideoCard
//                             key={video.videoId}
//                             video={video}
//                             formatDuration={formatDuration}
//                             navigate={navigate}
//                             isHovered={hoveredVideo === video.videoId}
//                             onHover={(id) => {
//                                 setHoveredVideo(id)
//                                 setHoveredCardIndex(index)
//                             }}
//                         />
//                     ))}

//                     {/* Expanded Info - Positioned based on hovered card */}
//                     {hoveredVideo && (
//                         <div
//                             className="expanded-info-container"
//                             style={{
//                                 left: `${hoveredCardIndex * 288}px` // 280px card + 8px gap
//                             }}
//                         >
//                             {videos.map(video =>
//                                 video.videoId === hoveredVideo && (
//                                     <ExpandedInfo
//                                         key={video.videoId}
//                                         video={video}
//                                         formatDuration={formatDuration}
//                                     />
//                                 )
//                             )}
//                         </div>
//                     )}
//                 </div>

//                 <button className="row-arrow right-arrow" onClick={() => scroll('right')}>
//                     <svg width="30" height="30" viewBox="0 0 24 24" fill="white">
//                         <polygon points="9 18 15 12 9 6"></polygon>
//                     </svg>
//                 </button>
//             </div>
//         </div>
//     )
// }

function VideoRow({ title, videos, formatDuration, navigate }) {
    const rowRef = useRef(null);

    const scroll = (direction) => {
        if (rowRef.current) {
            const scrollAmount = direction === 'left' ? -800 : 800;
            rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    if (videos.length === 0) return null;

    return (
        <div className="video-row">
            <h2 className="row-title">{title}</h2>
            <div className="row-wrapper">
                <button className="row-arrow left-arrow" onClick={() => scroll('left')}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><polygon points="15 18 9 12 15 6"></polygon></svg>
                </button>

                <div className="row-content" ref={rowRef}>
                    {videos.map((video) => (
                        <VideoCard
                            key={video.videoId}
                            video={video}
                            formatDuration={formatDuration}
                            navigate={navigate}
                        />
                    ))}
                </div>

                <button className="row-arrow right-arrow" onClick={() => scroll('right')}>
                    <svg width="30" height="30" viewBox="0 0 24 24" fill="white"><polygon points="9 18 15 12 9 6"></polygon></svg>
                </button>
            </div>
        </div>
    );
}

function VideoCard({ video, formatDuration, navigate }) {
    const [isHovered, setIsHovered] = useState(false);
    const cardRef = useRef(null);
    const timeoutRef = useRef(null);

    const handleMouseEnter = () => {
        // 400ms delay prevents accidental flickers
        timeoutRef.current = setTimeout(() => setIsHovered(true), 400);
    };

    const handleMouseLeave = () => {
        clearTimeout(timeoutRef.current);
        setIsHovered(false);
    };

    return (
        <>
            <div
                ref={cardRef}
                className={`video-card ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                onClick={() => navigate(`/watch/${video.videoId}`)}
            >
                <div className="card-thumbnail">
                    <img src={video.thumbnail} alt={video.title} loading="lazy" />
                    <div className="quality-badge">HD</div>
                    <div className="duration-badge">{formatDuration(video.duration)}</div>

                    {isHovered && (
                        <div className="card-hover-overlay">
                            <div className="hover-actions">
                                <button className="hover-btn play-btn-small" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/watch/${video.videoId}`);
                                }}>
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>
                                </button>
                                <button className="hover-btn icon-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                </button>
                                <button className="hover-btn icon-btn">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* The Portal renders the info outside the scrolling container */}
            <HoverInfoPortal targetRef={cardRef} isOpen={isHovered}>
                <div className="expanded-info-content">
                    <h3 className="card-title-expanded">{video.title}</h3>
                    <div className="card-meta-expanded">
                        <span className="match-text">98% Match</span>
                        <span className="year-text">{new Date(video.createdAt).getFullYear()}</span>
                        <span className="hd-badge-small">HD</span>
                        <span className="duration-text">{formatDuration(video.duration)}</span>
                    </div>
                    <div className="card-tags-expanded">
                        <span className="tag">Drama</span>
                        <span className="tag-separator">•</span>
                        <span className="tag">Streaming</span>
                        <span className="tag-separator">•</span>
                        <span className="tag">{video.resolution || '1080p'}</span>
                    </div>
                    <p className="card-description">
                        Watch your uploaded video in stunning quality. Stream instantly across all your devices.
                    </p>
                </div>
            </HoverInfoPortal>
        </>
    );
}


// function VideoCard({ video, formatDuration, navigate, isHovered, onHover }) {
//     const hoverTimeoutRef = useRef(null)

//     const handleMouseEnter = () => {
//         hoverTimeoutRef.current = setTimeout(() => {
//             onHover(video.videoId)
//         }, 500)
//     }

//     const handleMouseLeave = () => {
//         clearTimeout(hoverTimeoutRef.current)
//         onHover(null)
//     }

//     return (
//         <div
//             className={`video-card ${isHovered ? 'hovered' : ''}`}
//             onMouseEnter={handleMouseEnter}
//             onMouseLeave={handleMouseLeave}
//         >
//             <div className="card-thumbnail" onClick={() => navigate(`/watch/${video.videoId}`)}>
//                 <img src={video.thumbnail} alt={video.title} loading="lazy" />
//                 <div className="quality-badge">HD</div>
//                 <div className="duration-badge">{formatDuration(video.duration)}</div>

//                 {isHovered && (
//                     <div className="card-hover-overlay">
//                         <div className="hover-actions">
//                             <button className="hover-btn play-btn-small" onClick={(e) => {
//                                 e.stopPropagation()
//                                 navigate(`/watch/${video.videoId}`)
//                             }}>
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
//                                     <polygon points="5 3 19 12 5 21 5 3"></polygon>
//                                 </svg>
//                             </button>
//                             <button className="hover-btn icon-btn">
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <line x1="12" y1="5" x2="12" y2="19"></line>
//                                     <line x1="5" y1="12" x2="19" y2="12"></line>
//                                 </svg>
//                             </button>
//                             <button className="hover-btn icon-btn">
//                                 <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                                     <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
//                                 </svg>
//                             </button>
//                         </div>
//                     </div>
//                 )}
//             </div>
//         </div>
//     )
// }

function ExpandedInfo({ video, formatDuration }) {
    return (
        <div className="expanded-info-content">
            <h3 className="card-title-expanded">{video.title}</h3>
            <div className="card-meta-expanded">
                <span className="match-text">98% Match</span>
                <span className="year-text">{new Date(video.createdAt).getFullYear()}</span>
                <span className="hd-badge-small">HD</span>
                <span className="duration-text">{formatDuration(video.duration)}</span>
            </div>
            <div className="card-tags-expanded">
                <span className="tag">Drama</span>
                <span className="tag-separator">•</span>
                <span className="tag">Streaming</span>
                <span className="tag-separator">•</span>
                <span className="tag">{video.resolution || '1080p'}</span>
            </div>
            <p className="card-description">
                Watch your uploaded video in stunning quality. Stream instantly across all your devices.
            </p>
        </div>
    )
}

export default VideoCatalog