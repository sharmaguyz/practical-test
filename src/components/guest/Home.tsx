"use client";
import Link from "next/link";
import TestimonialCarousel from "../carousel/TestimonialCarousel";
import { isStudentLoggedIn } from "@/helpers/commonHelper";
export default function HomePage() {
    const loginStatus = isStudentLoggedIn();
    return (
        <>
            <div className="hero-sec">
                <div className="container mx-auto">
                    <div className="hero-banner-grid grid grid-cols-2 lg:grid-cols-2 gap-5">
                        <div className="card left-card card-bg-img bg-white">
                            <div className="title">
                                <h1>Master Cybersecurity with Hands-On Learning</h1>
                            </div>
                            <div className="text">
                                <p>
                                    We believe that learning should be more than just theory—it should
                                    be practical, immersive, and directly applicable to real-world
                                    jobs.
                                </p>
                            </div>
                            <div className="common-btn">
                                <Link href="/courses" className="browse-btn rounded-full">
                                    <span>Browse Courses</span>
                                </Link>
                                {!loginStatus && 
                                    <Link href="/signup" className="sign-up-btn rounded-full">
                                        <span>Sign Up</span>{" "}
                                        <span>
                                            <img src="/web/images/maki_arrow.png" alt="" />
                                        </span>
                                    </Link>
                                }
                            </div>
                            <div className="hero-review">
                                <div className="grid grid-cols-2 lg:grid-cols-2 gap-4">
                                    <div className="review-detail flex items-center justify-between gap-2 w-80">
                                        <ul>
                                            <li>
                                                <img src="/web/images/Ellipse 1.png" className="" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Ellipse 2.png" className="" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Ellipse 3.png" className="" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Ellipse 4.png" className="" alt="" />
                                            </li>
                                        </ul>
                                        <h6>More than 100+ Students enrolled</h6>
                                    </div>
                                    <div className="review-stars flex items-center justify-end gap-2 w-50 ml-auto">
                                        <p>5.0</p>
                                        <ul>
                                            <li>
                                                <img src="/web/images/Review-Stars.png" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Review-Stars.png" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Review-Stars.png" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Review-Stars.png" alt="" />
                                            </li>
                                            <li>
                                                <img src="/web/images/Review-Stars.png" alt="" />
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="card right-card bg-white">
                            <div className="hero-banner-img">
                                <img src="/web/images/Hero-Banner-img.png" alt="" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="cybersecurity-courses">
                <div className="container mx-auto">
                    <div className="inner-cybersecurity-courses">
                        <div className="card bg-white sec-bg-img">
                            <div className="sec-top-content">
                                <div className="title">
                                    <h2>Explore Our Cybersecurity Courses</h2>
                                </div>
                                <div className="text">
                                    <p>
                                        Our vision is to bridge the gap between classroom learning and
                                        on-the-job performance, ensuring students don’t just understand
                                        concepts but know exactly how to apply them in a professional
                                        setting.
                                    </p>
                                </div>
                            </div>
                            <div className="cybersecurity-courses-boxes grid grid-cols-2 lg:grid-cols-2 gap-4 lg:gap-8">
                                <div className="card-box">
                                    <div className="card-box-img">
                                        <img src="/web/images/Cybersecurity-Courses-img1.png" alt="" />
                                        <div className="card-box-btn">
                                            <Link href="">
                                                <img src="/web/images/maki_arrow-black.png" alt="" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="card-box-content">
                                        <div className="card-title flex justify-between items-center">
                                            <h4>Introduction to Ethical Hacking</h4>
                                            <div className="brand-img">
                                                <img src="/web/images/rowan-university-logo1.png" alt="" />
                                            </div>
                                        </div>
                                        <div className="course-price">
                                            <h6>$129.00</h6>
                                        </div>
                                        <div className="course-text">
                                            <p>
                                                This course provides a hands-on introduction to ethical
                                                hacking and penetration testing. Students will gain
                                                real-world experience using industry-standard tools to
                                                assess and secure systems. Topics include:
                                            </p>
                                        </div>
                                        <div className="course-box-bottom flex justify-between items-center">
                                            <div className="author flex items-center gap-3">
                                                <div className="author-profile-img">
                                                    <img src="/web/images/author-profile-img.png" alt="" />
                                                </div>
                                                <div className="author-name">
                                                    <h5>Joe Brickley, D.Sc</h5>
                                                </div>
                                            </div>
                                            <div className="course-duration">
                                                <h5>
                                                    <img src="/web/images/time-clock.png" alt="" /> Duration:{" "}
                                                    <span>15 weeks</span>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="card-box">
                                    <div className="card-box-img">
                                        <img src="/web/images/Cybersecurity-Courses-img2.png" alt="" />
                                        <div className="card-box-btn">
                                            <Link href="">
                                                <img src="/web/images/maki_arrow-black.png" alt="" />
                                            </Link>
                                        </div>
                                    </div>
                                    <div className="card-box-content">
                                        <div className="card-title flex justify-between items-center">
                                            <h4>Cyber Defense of Operating Systems</h4>
                                            <div className="brand-img">
                                                <img src="/web/images/rowan-university-logo2.png" alt="" />
                                            </div>
                                        </div>
                                        <div className="course-price">
                                            <h6>$99.00</h6>
                                        </div>
                                        <div className="course-text">
                                            <p>
                                                This course provides hands-on training in securing and
                                                hardening operating systems, focusing on compliance
                                                frameworks and real-world cybersecurity practices.
                                            </p>
                                        </div>
                                        <div className="course-box-bottom flex justify-between items-center">
                                            <div className="author flex items-center gap-3">
                                                <div className="author-profile-img">
                                                    <img src="/web/images/author-profile-img.png" alt="" />
                                                </div>
                                                <div className="author-name">
                                                    <h5>Joe Brickley, D.Sc</h5>
                                                </div>
                                            </div>
                                            <div className="course-duration">
                                                <h5>
                                                    <img src="/web/images/time-clock.png" alt="" /> Duration:{" "}
                                                    <span>15 weeks</span>
                                                </h5>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="lwu-sec">
                <div className="container mx-auto">
                    <div className="card bg-white lwu-bg-img">
                        <div className="left-lwu-content">
                            <div className="title">
                                <h2>Why Learn with Us?</h2>
                            </div>
                            <div className="text">
                                <p>
                                    Our students don’t just learn— they train for the job they want.
                                    Many courses focus on theory alone, but Practical Academy takes it
                                    a step further. We provide hands-on, real-world training that
                                    mirrors the exact tasks and challenges professionals face in the
                                    field.
                                </p>
                            </div>
                        </div>
                        <div className="right-lwu-content">
                            <div className="lwu-content-boxes grid grid-cols-2 sm:grid-cols-2 gap-5">
                                <div className="lwu-content-box">
                                    <div className="lwu-content-top flex items-center gap-3">
                                        <div className="lwu-box-icon">
                                            <img src="/web/images/icon-1.png" alt="" />
                                        </div>
                                        <div className="lwu-box-title">
                                            <h5>Hands-On Learning</h5>
                                        </div>
                                    </div>
                                    <div className="lwu-box-text">
                                        <p>
                                            Get real-world experience with AWS-hosted labs. Our
                                            cloud-based training environment leverages AWS for highly
                                            performing reliable courses.
                                        </p>
                                    </div>
                                </div>
                                <div className="lwu-content-box">
                                    <div className="lwu-content-top flex items-center gap-3">
                                        <div className="lwu-box-icon">
                                            <img src="/web/images/icon-2.png" alt="" />
                                        </div>
                                        <div className="lwu-box-title">
                                            <h5>Real-World Training</h5>
                                        </div>
                                    </div>
                                    <div className="lwu-box-text">
                                        <p>
                                            Every course is designed to teach practical skills that are
                                            directly applicable in career roles.
                                        </p>
                                    </div>
                                </div>
                                <div className="lwu-content-box">
                                    <div className="lwu-content-top flex items-center gap-3">
                                        <div className="lwu-box-icon">
                                            <img src="/web/images/icon-3.png" alt="" />
                                        </div>
                                        <div className="lwu-box-title">
                                            <h5>Custom Courses</h5>
                                        </div>
                                    </div>
                                    <div className="lwu-box-text">
                                        <p>
                                            We develop tailored learning paths for students,
                                            professionals, and organizations to meet specific career
                                            goals.
                                        </p>
                                    </div>
                                </div>
                                <div className="lwu-content-box">
                                    <div className="lwu-content-top flex items-center gap-3">
                                        <div className="lwu-box-icon">
                                            <img src="/web/images/icon-4.png" alt="" />
                                        </div>
                                        <div className="lwu-box-title">
                                            <h5>On-The-Job Task</h5>
                                        </div>
                                    </div>
                                    <div className="lwu-box-text">
                                        <p>
                                            Tasks are geared to prepare our students to crush interviews
                                            by explaining exactly how to perform On-The-Job task prior to
                                            landing the job!
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="testimonial">
                <div className="container mx-auto">
                    <div className="card bg-white testimonial-bg-img">
                        <div className="inner-testimonial">
                            <div className="left-testimonial">
                                <div className="title">
                                    <h2>What Our Students Say</h2>
                                </div>
                                <div className="text">
                                    <p>
                                        Hear from students who have advanced their careers with
                                        Practical Academy.
                                    </p>
                                </div>
                            </div>
                            <div className="right-testimonial-slider">
                                <div className="owl-carousel owl-theme" id="testimonialReviews">
                                    {/* <div className="item" style={{ width: 329 }}>
                                        <div className="our-student-say">
                                            <div className="review-stars flex items-center gap-2">
                                                <p>4.9</p>
                                                <ul>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text">
                                                <p>
                                                    Practical Academy helped me land my first cybersecurity
                                                    job. The hands-on labs were exactly what I needed to feel
                                                    job-ready!
                                                </p>
                                            </div>
                                            <div className="course-box-bottom">
                                                <div className="author flex items-center gap-3">
                                                    <div className="author-profile-img">
                                                        <img src="/web/images/testimonial-img1.png" alt="" />
                                                    </div>
                                                    <div className="author-name">
                                                        <h5>Alex M. Rowan Student</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item" style={{ width: 329 }}>
                                        <div className="our-student-say">
                                            <div className="review-stars flex items-center gap-2">
                                                <p>4.9</p>
                                                <ul>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text">
                                                <p>
                                                    The AWS-based learning approach made everything click. I
                                                    highly recommend this to anyone serious about security.
                                                </p>
                                            </div>
                                            <div className="course-box-bottom">
                                                <div className="author flex items-center gap-3">
                                                    <div className="author-profile-img">
                                                        <img src="/web/images/testimonial-img2.png" alt="" />
                                                    </div>
                                                    <div className="author-name">
                                                        <h5>Emma R., U Delaware Student</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item" style={{ width: 329 }}>
                                        <div className="our-student-say">
                                            <div className="review-stars flex items-center gap-2">
                                                <p>4.9</p>
                                                <ul>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text">
                                                <p>
                                                    Practical Academy helped me land my first cybersecurity
                                                    job. The hands-on labs were exactly what I needed to feel
                                                    job-ready!
                                                </p>
                                            </div>
                                            <div className="course-box-bottom">
                                                <div className="author flex items-center gap-3">
                                                    <div className="author-profile-img">
                                                        <img src="/web/images/testimonial-img3.png" alt="" />
                                                    </div>
                                                    <div className="author-name">
                                                        <h5>Alex M. Rowant Student</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item" style={{ width: 329 }}>
                                        <div className="our-student-say">
                                            <div className="review-stars flex items-center gap-2">
                                                <p>4.9</p>
                                                <ul>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text">
                                                <p>
                                                    Practical Academy helped me land my first cybersecurity
                                                    job. The hands-on labs were exactly what I needed to feel
                                                    job-ready!
                                                </p>
                                            </div>
                                            <div className="course-box-bottom">
                                                <div className="author flex items-center gap-3">
                                                    <div className="author-profile-img">
                                                        <img src="/web/images/testimonial-img1.png" alt="" />
                                                    </div>
                                                    <div className="author-name">
                                                        <h5>Alex M. Rowan Student</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item" style={{ width: 329 }}>
                                        <div className="our-student-say">
                                            <div className="review-stars flex items-center gap-2">
                                                <p>4.9</p>
                                                <ul>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text">
                                                <p>
                                                    The AWS-based learning approach made everything click. I
                                                    highly recommend this to anyone serious about security.
                                                </p>
                                            </div>
                                            <div className="course-box-bottom">
                                                <div className="author flex items-center gap-3">
                                                    <div className="author-profile-img">
                                                        <img src="/web/images/testimonial-img2.png" alt="" />
                                                    </div>
                                                    <div className="author-name">
                                                        <h5>Emma R., U Delaware Student</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="item" style={{ width: 329 }}>
                                        <div className="our-student-say">
                                            <div className="review-stars flex items-center gap-2">
                                                <p>4.9</p>
                                                <ul>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                    <li>
                                                        <img src="/web/images/Review-Stars.png" alt="" />
                                                    </li>
                                                </ul>
                                            </div>
                                            <div className="text">
                                                <p>
                                                    Practical Academy helped me land my first cybersecurity
                                                    job. The hands-on labs were exactly what I needed to feel
                                                    job-ready!
                                                </p>
                                            </div>
                                            <div className="course-box-bottom">
                                                <div className="author flex items-center gap-3">
                                                    <div className="author-profile-img">
                                                        <img src="/web/images/testimonial-img3.png" alt="" />
                                                    </div>
                                                    <div className="author-name">
                                                        <h5>Alex M. Rowant Student</h5>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div> */}
                                    <TestimonialCarousel/>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="both-banner-sec">
                <div className="container mx-auto">
                    <div className="inner-both-banner">
                        <div className="card bg-white">
                            <div className="both-banner-grid grid grid-cols-2 lg:grid-cols-2 gap-8">
                                <div className="share-expertise-box">
                                    <div className="both-box-img">
                                        <img src="/web/images/both-section-img1.png" alt="" />
                                    </div>
                                    <div className="title">
                                        <h2>Teach Cybersecurity &amp; Earn Revenue</h2>
                                    </div>
                                    <div className="text">
                                        <p>
                                            Share your expertise, grow your brand, and earn money by
                                            creating and teaching cybersecurity courses on our platform.
                                        </p>
                                    </div>
                                    <div className="courses-btn">
                                        <Link href="">
                                            <span className="btn-text apply-now-btn">
                                                {" "}
                                                <span>Apply Now</span>
                                            </span>{" "}
                                            <span className="btn-icon">
                                                <img src="/web/images/maki_arrow.png" alt="" />
                                            </span>
                                        </Link>
                                    </div>
                                </div>
                                <div className="choose-course-box">
                                    <div className="both-box-img">
                                        <img src="/web/images/both-section-img2.png" alt="" />
                                    </div>
                                    <div className="title">
                                        <h2>Start Your Cybersecurity Journey Today</h2>
                                    </div>
                                    <div className="text">
                                        <p>
                                            Choose a course, gain hands-on experience, and level up your
                                            cybersecurity studies.
                                        </p>
                                    </div>
                                    <div className="choose-course-btns flex justify-center gap-3">
                                        <Link href="/courses" className="browse-courses-btn">
                                            <span>Browse Courses</span>
                                        </Link>
                                        { !loginStatus && 
                                            <Link href="/signup" className="sign-up-now-btn">
                                                <span>Sign Up Now</span>{" "}
                                                <span>
                                                    <img src="/web/images/maki_arrow.png" alt="" />
                                                </span>
                                            </Link>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
