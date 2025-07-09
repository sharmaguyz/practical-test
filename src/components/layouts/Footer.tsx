"use client";
import Link from "next/link";
import { isStudentLoggedIn } from "@/helpers/commonHelper";
export default function Footer() {
    const loginStatus = isStudentLoggedIn();
    if(loginStatus) return ;
    return (
        <footer className="footer">
            <div className="container mx-auto">
                <div className="card bg-white">
                    <div className="foot-grid grid grid-cols-2 lg:grid-cols-2 gap-5">
                        <div className="left-foot-content">
                            <div className="foot-description">
                                <div className="foot-logo">
                                <img src="/web/images/Foot-Site-Logo.png" alt="" />
                                </div>
                                <div className="text">
                                <p>Practical Academy was founded with a clear goal: to revolutionize education by making it practical, affordable, and job-focused.</p>
                                </div>
                            </div>
                            <div className="mob-foot-content">
                                <div className="subscribe-sec">
                                <div className="foot-title">
                                    <h5>Subscribe for new courses &amp; exclusive offers!</h5>
                                </div>
                                <div className="subscribe-field">
                                    <form>
                                    <div className="form-group">
                                        <input type="text" name="" className="form-control" id="" placeholder="Your Email" />
                                    </div>
                                    <div className="subscribe-btn">
                                        <button type="button">Join our Newsletter!</button>
                                    </div>
                                    </form>
                                </div>
                                </div>
                                <div className="foot-action-links">
                                <div className="quick-links">
                                    <div className="foot-title">
                                    <h5>Quick Links</h5>
                                    </div>
                                    <div className="foot-links">
                                    <ul>
                                        <li><Link href="/">Browse Courses</Link></li>
                                        <li><Link href="/instructor-signup">Become an Instructor</Link></li>
                                        <li><Link href="/about-us">About Us</Link></li>
                                        <li><Link href="">Instructors</Link></li>
                                        <li><Link href="">FAQs</Link></li>
                                        <li><Link href="/contact-us">Contact Us</Link></li>
                                    </ul>
                                    </div>
                                </div>
                                <div className="legal-policies-links">
                                    <div className="foot-title">
                                    <h5>Legal &amp; Policies</h5>
                                    </div>
                                    <div className="foot-links">
                                    <ul>
                                        <li><Link href="">Terms &amp; Conditions</Link></li>
                                        <li><Link href="">Privacy Policy</Link></li>
                                        <li><Link href="">Refund Policy</Link></li>
                                    </ul>
                                    </div>
                                </div>
                                <div className="support-contact-links">
                                    <div className="foot-title">
                                    <h5>Support &amp; Contact</h5>
                                    </div>
                                    <div className="foot-links">
                                    <ul>
                                        <li className="address">
                                        <p>Headquarters</p> <Link href="">Wildwood NJ <span><img src="/web/images/us-flag.png" alt="" /></span></Link>
                                        </li>
                                        <li>
                                        <p>Email</p> <Link href="">practicalacademyllc@gmail.com</Link>
                                        </li>
                                    </ul>
                                    </div>
                                </div>
                                </div>
                            </div>
                            <div className="stay-touched">
                                <div className="foot-title">
                                <h5>Let’s Stay in Touch</h5>
                                </div>
                                <div className="text">
                                <p>Follow Practical Academy on social media to stay updated on our latest news.</p>
                                </div>
                                <div className="foot-social-icons">
                                <ul>
                                    <li>
                                    <Link href="https://www.youtube.com/@PracticalAcademy" target="_blank"><img src="/web/images/Youtube-icon.png" alt="" /></Link>
                                    </li>
                                </ul>
                                </div>
                                <div className="copyright-text flex justify-between items-center">
                                <span>© 2025 Practical Academy.</span>
                                <span>All Rights Reserved.</span>
                                </div>
                            </div>
                        </div>
                        <div className="right-foot-content desktop-foot-content">
                            <div className="subscribe-sec">
                                <div className="foot-title">
                                <h5>Subscribe for new courses &amp; exclusive offers!</h5>
                                </div>
                                <div className="subscribe-field">
                                <form>
                                    <div className="form-group">
                                    <input type="text" name="" className="form-control" id="" placeholder="Your Email" />
                                    </div>
                                    <div className="subscribe-btn">
                                    <button type="button">Join our Newsletter!</button>
                                    </div>
                                </form>
                                </div>
                            </div>
                            <div className="foot-action-links">
                                <div className="quick-links">
                                <div className="foot-title">
                                    <h5>Quick Links</h5>
                                </div>
                                <div className="foot-links">
                                    <ul>
                                    <li><Link href="/">Browse Courses</Link></li>
                                    <li><Link href="/instructor-signup">Become an Instructor</Link></li>
                                    <li><Link href="/about-us">About Us</Link></li>
                                    <li><Link href="">Instructors</Link></li>
                                    <li><Link href="">FAQs</Link></li>
                                    <li><Link href="/contact-us">Contact Us</Link></li>
                                    </ul>
                                </div>
                                </div>
                                <div className="legal-policies-links">
                                <div className="foot-title">
                                    <h5>Legal &amp; Policies</h5>
                                </div>
                                <div className="foot-links">
                                    <ul>
                                    <li><Link href="">Terms &amp; Conditions</Link></li>
                                    <li><Link href="">Privacy Policy</Link></li>
                                    <li><Link href="">Refund Policy</Link></li>
                                    </ul>
                                </div>
                                </div>
                                <div className="support-contact-links">
                                <div className="foot-title">
                                    <h5>Support &amp; Contact</h5>
                                </div>
                                <div className="foot-links">
                                    <ul>
                                    <li className="address">
                                        <p>Headquarters</p> <Link href="">Wildwood NJ <span><img src="/web/images/us-flag.png" alt="" /></span></Link>
                                    </li>
                                    <li>
                                        <p>Email</p> <Link href="">practicalacademyllc@gmail.com</Link>
                                    </li>
                                    </ul>
                                </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
  }
  