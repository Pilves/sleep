<script>
    import { page } from '$app/stores';
    import { authUser, isAdmin, userRoles } from '$lib/stores/authStore';
    import { browser } from '$app/environment';

    $: currentPath = $page.url.pathname;
    
    // Debug output for admin status
    $: if (browser) {
        console.log('Admin status in sidebar:', $isAdmin);
        console.log('User roles in sidebar:', $userRoles);
    }
</script>

<aside class="sidebar">
    <div class="logo-container">
        <a href="/" class="logo">
            <div class="logo-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 30">
                    <circle cx="15" cy="15" r="13" fill="#60A5FA" />
                    <path d="M15 28C7.82 28 2 22.18 2 15S7.82 2 15 2s13 5.82 13 13c0 1.49-.25 2.92-.71 4.25-2.7-3.02-6.87-4.93-11.58-4.93-4.27 0-8.11 1.57-10.8 4.07C6.09 23.25 10.17 26 15 26c2.34 0 4.51-.69 6.33-1.86.8.83 1.78 1.42 2.88 1.73C21.76 27.21 18.47 28 15 28z" fill="#fff"/>
                </svg>
            </div>
            <div class="logo-text">SLEEP OLYMPICS</div>
        </a>
    </div>

    <nav class="nav-menu">
        <a
                href="/dashboard"
                class="nav-item {currentPath === '/dashboard' ? 'active' : ''}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="7" height="9" />
                <rect x="14" y="3" width="7" height="5" />
                <rect x="14" y="12" width="7" height="9" />
                <rect x="3" y="16" width="7" height="5" />
            </svg>
            Dashboard
        </a>

        <a
                href="/competitions"
                class="nav-item {currentPath.startsWith('/competitions') ? 'active' : ''}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 0 1-2 2zm14-10V4a2 2 0 0 0-2-2H10a2 2 0 0 0-2 2v5h14zm-8-4a1 1 0 0 1 0 2 1 1 0 0 1 0-2z"/>
                <path d="M4 15h2M4 15v3a2 2 0 0 0 2 2h2M4 15V5"/>
            </svg>
            Competitions
        </a>

        <a
                href="/leaderboard"
                class="nav-item {currentPath === '/leaderboard' ? 'active' : ''}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 21v-8M15 21v-11M12 21v-6M9 21V11M6 21V8"/>
            </svg>
            Leaderboard
        </a>

        <a
                href="/sleep-history"
                class="nav-item {currentPath === '/sleep-history' ? 'active' : ''}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06z"/>
                <path d="M10 2c1 .5 2 2 2 5"/>
            </svg>
            Sleep Data
        </a>

        <a
                href="/profile"
                class="nav-item {currentPath === '/profile' ? 'active' : ''}"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
            Profile
        </a>
        
        {#if $isAdmin}
        <div>        
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3h18v18H3zM12 8v8M8 12h8"></path>
             </svg>
          </div>

        <a
                href="/admin/competitions"
                class="nav-item admin-item {currentPath.startsWith('/admin') ? 'active' : ''}"
        >
            Competitions Panel
        </a>
        <a
        href="/admin/invitations"
        class="nav-item admin-item {currentPath.startsWith('/admin') ? 'active' : ''}"
        >
            Invitations Management Panel
        </a>
        <a
        href="/admin/users"
        class="nav-item admin-item {currentPath.startsWith('/admin') ? 'active' : ''}"
        >
            Users Panel
        </a>
        {/if}
    </nav>

    {#if $authUser}
        <div class="user-container">
            <div class="avatar">
                {$authUser.displayName?.[0] || $authUser.email[0].toUpperCase()}
            </div>
            <div class="user-info">
                <div class="user-name">{$authUser.displayName || 'User'}</div>
                <div class="user-email">{$authUser.email}</div>
            </div>
        </div>
    {/if}
</aside>

<style>
    .sidebar {
        background-color: white;
        width: 240px;
        height: 100vh;
        position: fixed;
        top: 0;
        left: 0;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.05);
        display: flex;
        flex-direction: column;
        z-index: 1000;
    }

    .logo-container {
        padding: 20px;
        border-bottom: 1px solid #f0f0f0;
    }

    .logo {
        display: flex;
        align-items: center;
        text-decoration: none;
    }

    .logo-icon {
        width: 32px;
        height: 32px;
        margin-right: 10px;
    }

    .logo-text {
        color: #333;
        font-weight: 600;
        font-size: 16px;
        letter-spacing: 0.5px;
    }

    .nav-menu {
        padding: 20px 0;
        flex: 1;
    }

    .nav-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        color: #555;
        text-decoration: none;
        font-weight: 500;
        transition: all 0.2s;
        border-left: 3px solid transparent;
    }

    .nav-item svg {
        margin-right: 12px;
        color: #777;
    }

    .nav-item:hover {
        background-color: rgba(96, 165, 250, 0.05);
        color: #60A5FA;
    }

    .nav-item:hover svg {
        color: #60A5FA;
    }

    .nav-item.active {
        background-color: rgba(96, 165, 250, 0.1);
        color: #60A5FA;
        border-left: 3px solid #60A5FA;
    }

    .nav-item.active svg {
        color: #60A5FA;
    }
    
    .admin-item {
        margin-top: 10px;
        background-color: #fdf2f8;
        color: #db2777;
        border-left: 3px solid #db2777;
    }
    
    .admin-item svg {
        color: #db2777;
    }
    
    .admin-item:hover {
        background-color: #fbcfe8;
        color: #be185d;
    }
    
    .admin-item:hover svg {
        color: #be185d;
    }
    
    .admin-item.active {
        background-color: #fce7f3;
        color: #be185d;
        border-left: 3px solid #be185d;
    }
    
    .admin-item.active svg {
        color: #be185d;
    }

    .user-container {
        padding: 15px 20px;
        display: flex;
        align-items: center;
        border-top: 1px solid #f0f0f0;
        margin-top: auto;
    }

    .avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background-color: #60A5FA;
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-right: 12px;
    }

    .user-info {
        overflow: hidden;
    }

    .user-name {
        font-weight: 600;
        font-size: 14px;
        color: #333;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .user-email {
        font-size: 12px;
        color: #888;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
        .sidebar {
            width: 70px;
        }

        .logo-text {
            display: none;
        }

        .nav-item {
            padding: 15px;
            justify-content: center;
        }

        .nav-item svg {
            margin-right: 0;
        }

        .nav-item span {
            display: none;
        }

        .user-container {
            justify-content: center;
            padding: 15px 10px;
        }

        .user-info {
            display: none;
        }
    }
</style>
