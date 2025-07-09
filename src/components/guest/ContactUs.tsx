"use client";
export default function ContactUsPage(){
    return (
        <>
        <div className="breadcrumbs">
          <div className="container mx-auto">
            <div className="inner-breadcrumbs">
              <nav
                className="flex card bg-white justify-between items-center"
                aria-label="Breadcrumb"
              >
                <div className="breadcrumbs-current-page">
                  <h2>Contact Us</h2>
                </div>
                <ol className="inline-flex items-center space-x-1 md:space-x-2 rtl:space-x-reverse">
                  <li className="inline-flex items-center">
                    <a
                      href="#"
                      className="inline-flex items-center text-sm font-medium text-gray-700 "
                    >
                      {" "}
                      Home{" "}
                    </a>
                  </li>
                  <li aria-current="page">
                    <div className="flex items-center">
                      <svg
                        className="rtl:rotate-180  w-3 h-3 mx-1"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 6 10"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="m1 9 4-4-4-4"
                        />
                      </svg>
                      <span className="ms-1 text-sm font-medium md:ms-2">
                        Contact Us
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="contact-us">
          <div className="container mx-auto">
            <div className="inner-contact-us">
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                <div className="card bg-white lwu-bg-img">
                  <div className="title">
                    <h2>Get In Touch</h2>
                  </div>
                  <div className="contact-form">
                    <form>
                      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 lg:gap-5">
                        <div className="form-group">
                          <label htmlFor="f-name">
                            Full Name <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name=""
                            id="f-name"
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="y-email">
                            Your Email <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name=""
                            id="y-email"
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="p-number">
                            Phone Number <span className="required">*</span>
                          </label>
                          <input
                            type="text"
                            name=""
                            id="p-number"
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <label htmlFor="y-country">
                            Country <span className="required">*</span>
                          </label>
                          <select name="" id="y-country">
                            <option value="">Select</option>
                            <option value="">Australia</option>
                            <option value="">Canada</option>
                            <option value="">India</option>
                            <option value="">United States</option>
                          </select>
                        </div>
                        <div className="form-group col-span-1 md:col-span-2">
                          <label htmlFor="y-message">Description</label>
                          <textarea name="" id="" defaultValue={""} />
                        </div>
                      </div>
                      <div className="submit-btn">
                        <button type="button">
                          <span>Submit</span>{" "}
                          <span>
                            <img src="/web/images/maki_arrow.png" alt="" />
                          </span>
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="card bg-white">
                  <div className="title">
                    <h2>Contact Details</h2>
                  </div>
                  <div className="contact-details-boxes">
                    <div className="contact-detail-box">
                      {/* <div class="inner-contact-info flex items-center gap-5">
                                    <div class="contact-icon flex items-center justify-center">
                                        <img src="/web/images/phone.png" alt="">
                                    </div>
      
                                    <div class="contact-info">
                                        <h4>Call Us At</h4>
                                        <a href="">+1 63980 98393</a>
                                    </div>
                                </div> */}
                      <div className="inner-contact-info flex items-center gap-5">
                        <div className="contact-icon flex items-center justify-center">
                          <img src="/web/images/mail.png" alt="" />
                        </div>
                        <div className="contact-info">
                          <h4>Email Us</h4>
                          <a href="">practicalacademyllc@gmail.com</a>
                        </div>
                      </div>
                      <div className="inner-contact-info flex items-center gap-5">
                        <div className="contact-icon flex items-center justify-center">
                          <img src="/web/images/map-pin.png" alt="" />
                        </div>
                        <div className="contact-info">
                          <h4>Location</h4>
                          <p>Wildwood, NJ, United States</p>
                        </div>
                      </div>
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