import React from 'react';
import './ProfileSelection.css';

function ProfileSelection({ onSelectProfile }) {

    const profiles = [
        {
            id: 'user1',
            name: 'sarthakbakshii',
            avatar: 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png',
        },
        {
            id: 'kids',
            name: 'Children',
            // Updated working image URL:
            avatar: 'https://wallpapers.com/images/hd/netflix-profile-pictures-1000-x-1000-v83aiw926ch1gd0x.jpg',
            isKids: true,
        },
    ];

    return (
        <div className="profile-gate-container">
            <div className="profile-gate-content">
                <h1 className="profile-title">Who's watching?</h1>
                <div className="profile-list">
                    {profiles.map((profile) => (
                        <div
                            key={profile.id}
                            className="profile-card"
                            onClick={() => onSelectProfile(profile)}
                        >
                            <div className="avatar-wrapper">
                                <img src={profile.avatar} alt={profile.name} />
                            </div>
                            <span className="profile-name">{profile.name}</span>
                        </div>
                    ))}

                    {/* Add Profile Tile */}
                    <div className="profile-card add-profile-btn">
                        <div className="avatar-wrapper add-wrapper">
                            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                            </svg>
                        </div>
                        <span className="profile-name">Add Profile</span>
                    </div>
                </div>

                <button className="manage-profiles-btn">Manage Profiles</button>
            </div>
        </div>
    );
}

export default ProfileSelection;