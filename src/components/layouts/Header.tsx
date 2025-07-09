"use client";
import Link from "next/link";
import AppLogo from "../common/AppLogo";
import { usePathname, useRouter } from 'next/navigation';
import { API_BASE_URL } from "../config/config";
import { useEffect, useState } from "react";
import { getLoggedInUser } from '@/helpers/authHelper';
import { isStudentLoggedIn } from "@/helpers/commonHelper";
import { setuid } from "process";
import { useCart } from '@/context/CartContext';
interface User {
    email: string;
    fullName: string;
    id: string;
}
export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const [user, setUser] = useState<User>({} as User);
    const loggedinstatus = isStudentLoggedIn();
    const { cartCount, setCartCount } = useCart();
    const handleLogout = async () => {
        const { token, IdToken, AccessToken } = getLoggedInUser();
        const via = JSON.parse(localStorage.getItem("via") || '{}');
        if(via){
            localStorage.removeItem('via');
        }
        try {
            if (token && IdToken && AccessToken) {
                await fetch(`${API_BASE_URL}/api/v1/user/logout`, {
                    method: 'POST',
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`,
                        "X-ID-TOKEN": IdToken,
                        "X-ACCESS-TOKEN": AccessToken,
                    },
                });
            }
        } catch (error) {
            console.error('Logout failed:', error);
        } finally {
            ['token', 'rolename', 'IdToken', 'AccessToken', 'RefreshToken','id','cartCount'].forEach((key) =>
                localStorage.removeItem(key)
            );
            router.push('/signin');
        }
    };
    useEffect(() => {
        const checkAndLogout = async () => {
            if (loggedinstatus) {
                const { token, IdToken, AccessToken } = getLoggedInUser();
                try {
                    if (token && IdToken && AccessToken) {
                        const response = await fetch(`${API_BASE_URL}/api/v1/user/get-profile`, {
                            method: 'GET',
                            headers: {
                                "Content-Type": "application/json",
                                "Authorization": `Bearer ${token}`,
                                "X-ID-TOKEN": IdToken,
                                "X-ACCESS-TOKEN": AccessToken,
                            },
                        });
                        const cartresponse = await fetch(`${API_BASE_URL}/api/v1/user/my-cart`, {
                            method: "GET",
                            headers: {
                            "Content-Type": "application/json",
                            Authorization: `Bearer ${token}`,
                            "X-ID-TOKEN": IdToken || "", 
                            "X-ACCESS-TOKEN": AccessToken || "",
                            }
                        });
                        const data = await response.json();
                        const cartDataResponse = await cartresponse.json();
                        const item = cartDataResponse.data.items;
                        setCartCount(item.length);
                        setUser(data.data.student);
                    }
                } catch (error) {
                    console.error('Logout failed:', error);
                }
            }
        };
    
        checkAndLogout();
    }, [loggedinstatus]);
    
    return (
        <header className="header bg-white" x-data="{ open: false }">
            <div className="container mx-auto">
                <nav className="flex items-center justify-between" aria-label="Global">
                    <div className="flex lg:flex-1">
                        <AppLogo />
                        {/* <a href="index.html" className="-m-1.5 p-1.5">
                    <span className="sr-only">Your Company</span>
                    <img className="w-auto" src="images/Site-Logo.png" alt="" />
                    </a> */}
                    </div>
                    <div className="mobile-action-both-btn flex lg:hidden gap-8">
                        <div className="mobile-search">
                            <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                                <img src="/images/search/search-fat.png" alt="" />
                            </button>
                        </div>
                        <div className="mobile-bars">
                            <button type="button" className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700">
                                <span className="sr-only">Open main menu</span>
                                <img src="/images/others/Menu-Bars.png" alt="" />
                            </button>
                        </div>
                    </div>
                    <div className="site-menu hidden lg:flex lg:gap-x-5 items-center">
                        <div className="inner-site-menu hidden lg:flex lg:gap-x-8 xl:gap-x-12">
                            <Link href="/" className={`${pathname == '/' ? 'active' : ''} text-sm/6 font-semibold text-gray-900 lg:flex lg:gap-x-2 items-center`}>
                                <span>
                                    <img src="/images/icons/home.png" alt="" />
                                </span> Home
                            </Link>
                            <Link href="/courses" className={`${pathname == '/courses' || pathname.startsWith('course-detail')  ? 'active' : ''} text-sm/6 font-semibold text-gray-900 lg:flex lg:gap-x-2 items-center`}>
                                <span>
                                    <img src="/images/icons/book.png" alt="" />
                                </span> Courses
                            </Link>
                            <Link href="/about-us" className={`${pathname == '/about-us' ? 'active' : ''} text-sm/6 font-semibold text-gray-900`}>About us</Link>
                            <Link href="/contact-us" className={`${pathname == '/contact-us' ? 'active' : ''} text-sm/6 font-semibold text-gray-900`}>Contact us</Link>
                            {!loggedinstatus && (
                                <Link href="/instructor-signup" className={`${pathname == '/instructor-signup' ? 'active' : ''} text-sm/6 font-semibold text-gray-900`}>Become an
                                    Instructor</Link>)}
                        </div>
                        <div className="site-action-menu">
                            <div className="inner-site-action-menu hidden lg:flex lg:gap-x-5 items-center">
                                <Link href={ loggedinstatus ? '/cart' : '/signin'} className="cart-icon"><img src="/images/icons/head-cart-icon.png" alt="" /></Link>
                                { !loggedinstatus ? null : (cartCount > 0 ? <div className="cart-count">{cartCount}</div> : null)}
                                {!loggedinstatus &&
                                    (
                                        <>
                                            <Link href="/signin" className="login-menu rounded-full">Login</Link>
                                            <Link href="/signup" className="register-menu">Register</Link>
                                        </>
                                    )
                                }
                                {
                                    loggedinstatus && (
                                        <>
                                            <div className="menu-container">
                                                <button className="menu-button">
                                                    <img src="/web/images/user-placeholder.jpg" />
                                                    <span className="title">{user && user?.fullName}</span>
                                                    <span className="user-icon"><i className="fa-solid fa-caret-down"></i></span>
                                                </button>
                                                <div className="menu-dropdown">
                                                    <div className="content">
                                                        <ul>
                                                            <li><Link href="/dashboard">My Account</Link></li>
                                                            <li><a onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
                                                                e.preventDefault();
                                                                handleLogout();
                                                            }}>Logout</a></li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                    )
                                }
                            </div>
                        </div>
                    </div>
                </nav>
            </div>
            {/* Mobile menu, show/hide based on menu open state. */}
            <div className="mobile-menu lg:hidden" role="dialog" aria-modal="true">
                {/* <div class="fixed inset-0 z-10"></div> */}
                <div className="mob-menu-slide fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                    <div className="outer-mob-menu">
                        <div className="flex items-center justify-between">
                            {/* <a href="index.html" className="-m-1.5 p-1.5">
                            <span className="sr-only">Your Company</span>
                            <img className="w-auto" src="images/Site-Logo.png" alt="" />
                        </a> */}
                            <AppLogo />
                            <button type="button" className="mobile-menu-close-btn -m-2.5 rounded-md p-2.5 text-gray-700">
                                <span className="sr-only">Close menu</span>
                                <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="mobile-menu-list flow-root">
                            <div className="-my-6">
                                <div className="mobile-menu-iner-list space-y-2 py-6">
                                    <Link href="/" className="active -mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                        <span>
                                            <img src="/images/icons/home.png" alt="" />
                                        </span> Home
                                    </Link>
                                    <Link href="/courses" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                        <span>
                                            <img src="/images/icons/book.png" alt="" />
                                        </span> Courses
                                    </Link>
                                    <Link href="about-us.html" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">About
                                        Us</Link>
                                    <Link href="contact-us.html" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Contact
                                        Us</Link>
                                    <Link href="instructor-form.html" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">Become
                                        an Instructor</Link>
                                </div>
                                <div className="instructors-info">
                                    <div className="menu-small-title">
                                        <h6>For Instructors</h6>
                                    </div>
                                    <div className="ionstructors-menu">
                                        <Link href=""><span><img src="/images/others/ic_twotone-sell.png" alt="" /></span> Launch Your
                                            College Course</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mobile-action-btn">
                            <div className="login-mob-btn">
                                <Link href="/signin">Login</Link>
                            </div>
                            <div className="register-mob-btn">
                                <Link href="/signup">Register For Courses</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
