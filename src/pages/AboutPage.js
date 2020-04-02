import React from 'react';

class AboutPage extends React.Component {
  render() {
    return (
      <div className="page-about">
        <p>
          Mission: Find the real trends in covid progression, focusing on the USA. 
          Express no more certainty than the data warrants.
        </p>
        <p>
          dreaming of a day when covid flies away - ryan at ryan dawt org
        </p>
        <p>
          Source: <a href="https://covidtracking.com/">COVID Tracking Project</a>
        </p>
        <p>
          Source: <a href="https://github.com/CSSEGISandData/COVID-19">Johns Hopkins github repo</a>
        </p>
      </div>
    )
  }
}

export default AboutPage