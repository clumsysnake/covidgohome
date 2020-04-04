import React from 'react';

class AboutPage extends React.Component {
  render() {
    return (
      <div className="page-about">
        <p>
          <strong>Mission</strong>: Find the real trends in covid progression, focusing on the USA. 
          Express no more certainty than the data warrants.
        </p>
        <p>
          <strong>Source</strong>: <a href="https://covidtracking.com/">COVID Tracking Project</a>
        </p>
        <p>
          <strong>Source</strong>: <a href="https://github.com/CSSEGISandData/COVID-19">Johns Hopkins data</a>
        </p>
        <p>
          <strong>Source</strong>: <a href="https://github.com/nytimes/covid-19-data">NYT covid-19 data</a>
        </p>
        <p>
          dreaming of a day when covid flies away - ryan at ryan dawt org
        </p>
      </div>
    )
  }
}

export default AboutPage