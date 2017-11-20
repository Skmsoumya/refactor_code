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


function showStartupVideo() {
	if ($scope.listing.code === 'startuptour' && $scope.listing.config.default_date) {
		angular.forEach($scope.requestedListingData.bookables, function (bookable) {
			bookable.requested = 1;
		});
		return true;
	}

	return false;
}



/*
	check if the no dates selected or the selected dates are wrong
*/

function datesCheck(pakageType, isPastCheckInDate) {
	var datesFromCheck = !$scope.requestedListingData.date_from;
	var datesUntillCheck = !$scope.requestedListingData.date_until;

	var datesNotPresentCheck = pakageType === 1 ? ( 	datesFromCheck || 
											datesUntillCheck ) :
											datesFromCheck ;

	if (datesNotPresentCheck) {
		showMessage("dates_not_selected");
		return false;
	}
	
	var startupVideoCheck =  pakageType === 1 ? showStartupVideo() : false;
	var pastDateCheckPass = isPastCheckInDate ? startupVideoCheck : true;

	if (!pastDateCheckPass) {
		showMessage("dates_in_past");
	}
	return pastDateCheckPass;
}





$scope.checkAllFieldsPresent = function () {

	
	if ($scope.requestedListingData) {


		var atleastOneBookableSelected = false;
		var nowTemp = new Date();
		var currentDate = new Date(nowTemp.getFullYear(), nowTemp.getMonth(), nowTemp.getDate(), 0, 0, 0, 0);
		var isTodayCheckIn = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY').valueOf() == currentDate.getTime();
		var checkInDate = moment($scope.requestedListingData.date_from, 'DD/MM/YYYY').toDate();
		var isPastCheckInDate = checkInDate < currentDate;


		angular.forEach($scope.requestedListingData.bookables, function (value, key) {
			if (value && value.requested > 0) {
				atleastOneBookableSelected = true;
			}
		});
		var datesCheckVal = datesCheck($scope.packeageType, isPastCheckInDate);
		if(!datesCheckVal) {
			return datesCheckVal;
		}

		if (!atleastOneBookableSelected) {
			showMessage("no_stay_selected");
			return false;
		} else if (isTodayCheckIn && nowTemp.getHours() >= 24 - $scope.configs.min_hours_for_booking) {
			showMessage("booking_closed_for_today");
			return false;
		} else {
			return true;
		}

	/*
		If requested listing data not available show error and return;
	*/
	} else {
		showMessage("internal_server_error");
		return false;
	}
};
