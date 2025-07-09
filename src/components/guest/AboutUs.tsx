"use client";
export default function AboutUsPage(){
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
                  <h2>About Us</h2>
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
                        About Us
                      </span>
                    </div>
                  </li>
                </ol>
              </nav>
            </div>
          </div>
        </div>
        <div className="about-us">
          <div className="container mx-auto">
            <div className="inner-about">
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
                <div className="card bg-white lwu-bg-img flex items-center">
                  <div className="left-wwa">
                    <div className="title">
                      <h2>Who we are</h2>
                    </div>
                    <div className="text">
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1500s, when an unknown
                        printer took a galley of type and scrambled it to make a type
                        specimen book. It has survived not only five centuries, but
                        also the leap into electronic typesetting, remaining
                        essentially unchanged.
                      </p>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1500s, when an unknown
                        printer took a galley of type and scrambled it to make a type
                        specimen book. It has survived not only five centuries, but
                        also the leap into electronic typesetting, remaining
                        essentially unchanged.
                      </p>
                    </div>
                    <div className="wwa-list">
                      <ul>
                        <li>
                          <span className="list-icon" />{" "}
                          <span>Lorem Ipsum is simply dummy text</span>
                        </li>
                        <li>
                          <span className="list-icon" />{" "}
                          <span>Lorem Ipsum is simply dummy text</span>
                        </li>
                        <li>
                          <span className="list-icon" />{" "}
                          <span>Lorem Ipsum is simply dummy text</span>
                        </li>
                        <li>
                          <span className="list-icon" />{" "}
                          <span>Lorem Ipsum is simply dummy text</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="card bg-white">
                  <div className="wwa-img">
                    <img src="/web/images/WWA.png" alt="" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="our-mission">
          <div className="container mx-auto">
            <div className="inner-our-mission">
              <div className="card bg-white card-bg-img">
                <div className="sec-top-content">
                  <div className="title">
                    <h2>Our Mission</h2>
                  </div>
                  <div className="text">
                    <p>
                      Lorem Ipsum is simply dummy text of the printing and typesetting
                      industry. Lorem Ipsum has been the industry's standard dummy
                      text ever since the 1500s, when an unknown printer took a
                      galley.
                    </p>
                  </div>
                </div>
                <div className="our-mission-content grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  <div className="our-mission-box">
                    <div className="mission-box-icon">
                      <img src="/web/images/mission-statement.png" alt="" />
                    </div>
                    <div className="mission-box-content">
                      <h4>Mission</h4>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1500s, when an unknown
                        printer took a galley of type and scrambled it to make a type
                        specimen book.
                      </p>
                    </div>
                  </div>
                  <div className="our-mission-box">
                    <div className="mission-box-icon">
                      <img src="/web/images/idea-bulb.png" alt="" />
                    </div>
                    <div className="mission-box-content">
                      <h4>Vision</h4>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1500s, when an unknown
                        printer took a galley of type and scrambled it to make a type
                        specimen book.
                      </p>
                    </div>
                  </div>
                  <div className="our-mission-box">
                    <div className="mission-box-icon">
                      <img src="/web/images/scale.png" alt="" />
                    </div>
                    <div className="mission-box-content">
                      <h4>Values</h4>
                      <p>
                        Lorem Ipsum is simply dummy text of the printing and
                        typesetting industry. Lorem Ipsum has been the industry's
                        standard dummy text ever since the 1500s, when an unknown
                        printer took a galley of type and scrambled it to make a type
                        specimen book.
                      </p>
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