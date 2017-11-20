/*
	Define all the messages at a single point
*/
var messages = {
	"dates_not_selected": "Please select your check-in and check-out dates",
	"dates_in_past": "Please check-in date cannot be in past",
	"no_stay_selected": "Please select atleast one stay/experience",
	"booking_closed_for_today": "Booking is closed for today. Please try for next day.",
	"internal_server_error": "Internal error, please refresh the page and continue"
};

/*
	Show a message. 
	parameters :{
		message_code: "String", The key name of the message to show.
	}
*/
function showMessage(message_code) {
	$scope.showMessage(messages[message_code]);
}

/*
	Check if startup video is needed to be played
	returns: {
		true: if startup video has to be played,
		false: if no need to play startup video
	}
*/
function willShowStartupVideo() {
	if ($scope.listing.code === 'startuptour' && $scope.listing.config.default_date) {
		angular.forEach($scope.requestedListingData.bookables, function (bookable) {
			bookable.requested = 1;
		});
		return true;
	}

	return false;
}


/*
	check if dates are not selected

	returns: {
		false: dates are selected,
		true: dates are not selected
	}
*/
function checkDatesNotSelected() {
	var datesFromCheck = !$scope.requestedListingData.date_from;
	var datesUntillCheck = !$scope.requestedListingData.date_until;

	return pakageType === 1 ? 	( 	datesFromCheck || 
									datesUntillCheck ) :
									datesFromCheck ;
}

/*
	check if selected dates are in past. If in past check if startup video is to be played

	returns {
		false : if dates are valid or startup video has to be played,
		true: if dates are in past
	}
*/
function checkDatesAreInPast(checkInDate, currentDate) {
	var isPastCheckInDate = checkInDate < currentDate;
	var showingStartupVideo =  $scope.packeageType === 1 ? willShowStartupVideo() : false;
	return isPastCheckInDate ? !showingStartupVideo : false;
}

/*
	check if the no dates selected or the selected dates are wrong
	returns: {
		true: if all required dates are selected and are valid,
		false: if dates are not selected or are invalid
	}
*/

function checkSelectedDatesValid() {
	var datesNotSelected = checkDatesNotSelected();
	if(datesNotSelected) {
		showMessage("dates_not_selected");
		return false;
	}

	var nowTemp = new Date();
	var currentDate = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
	var isTodayCheckIn = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY').valueOf() == currentDate.getTime();
	var checkInDate = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY').toDate();
	
	var datesSelectedAreInPast = checkDatesAreInPast(checkInDate, currentDate);
	if (datesSelectedAreInPast) {
		showMessage("dates_in_past");
		return false;
	}
	else if(isTodayCheckIn && nowTemp.getHours() >= 24 - $scope.configs.min_hours_for_booking) {
		showMessage("booking_closed_for_today");
		return false;
	}
	else {
		return true;
	}
	
}


/*
	check bookable selected
	returns: {
		true: if atleast one selected,
		false: if no bookable selected
	}
*/

function checkAtleaseOneBookableSelected() {
	var atleastOneBookableSelected = false;
	angular.forEach($scope.requestedListingData.bookables, function (value, key) {
		if (value && value.requested > 0) {
			atleastOneBookableSelected = true;
		}
	});

	if(!atleastOneBookableSelected) {
		showMessage("no_stay_selected");
		return false;
	}
	else {
		return true;
	}
}




/*
	check if all the required fields are present. 
	returns: {
		false: if required fields are not present or invalid,
		true:  if required fields are present and are valid
	}
*/
$scope.checkAllFieldsPresent = function () {
	/*
		If requested listing data not available show error and return;
	*/
	if (!$scope.requestedListingData) {
		showMessage("internal_server_error");
		return false;
	}
	var datesCheckVal = checkSelectedDatesValid();
	var bookablePresent = checkAtleaseOneBookableSelected();
	return datesCheckVal && bookablePresent;
};
