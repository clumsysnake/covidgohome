import React from 'react'
import { Slider  } from '@material-ui/core';
import PropTypes from 'prop-types'
import moment from 'moment'

const SECONDS_IN_DAY = 86400
const CGH_DATE_FORMAT = 'YYYYMMDD'

export default function DateSlider(props) {
	let defaultDate = props.defaultDate || props.endDate

	if(!props.startDate || !props.endDate) { return null }

	function handleChange(e, v) {
		if(props.onChange) {
			props.onChange(parseInt(moment.unix(v).format(CGH_DATE_FORMAT)))
		}
	}

	function format(value, b) {
		return moment.unix(value).format('MMMDD')
	}

	let [min, max, defaultValue] = [props.startDate, props.endDate, defaultDate].map(d => {
		return moment(d, CGH_DATE_FORMAT).unix()
	})

	let dates = [min, max]
	let	marks = dates.map(d => ({value: d, label: moment.unix(d).format('MMM DD')}))

	return (
		<Slider
			classes={{root: 'date-slider'}}
			min={min}
			max={max}
			step={SECONDS_IN_DAY}
			color="secondary"
		  aria-labelledby="discrete-slider-small-steps"
		  onChange={handleChange}
		  marks={marks}
		  defaultValue={defaultValue}
		  valueLabelDisplay="auto"
		  valueLabelFormat={format}
		/>
	)
}

//dates expected as YYYYMMDD numbers
DateSlider.propTypes = {
	defaultDate: PropTypes.number,
	startDate: PropTypes.number,
	endDate: PropTypes.number,
	onChange: PropTypes.func
}