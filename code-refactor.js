var showMessage = function(message_code) {
	var messages = {
		"dates_not_selected": "Please select your check-in and check-out dates",
		"dates_in_past": "Please check-in date cannot be in past",
		"no_stay_selected": "Please select atleast one stay/experience",
		"booking_closed_for_today": "Booking is closed for today. Please try for next day.",
		"internal_server_error": "Internal error, please refresh the page and continue"
	};

	$scope.showMessage(messages[message_code]);
};


$scope.checkAllFieldsPresent = function () {

	/*
		Check if requested listing data present
	*/
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

		if ($scope.packeageType === 1) {
			if (!$scope.requestedListingData.date_from || !$scope.requestedListingData.date_until) {
				showMessage("dates_not_selected");				
				return false;
			} else {
				if (isPastCheckInDate) {
					showMessage("dates_in_past");
					return false;
				}
			}
		} else {
			if (!$scope.requestedListingData.date_from) {
				showMessage("dates_not_selected");
				return false;
			} else {
				// hack to get statup tour request video working
				if (isPastCheckInDate) {
					if ($scope.listing.code === 'startuptour' && $scope.listing.config.default_date) {
						angular.forEach($scope.requestedListingData.bookables, function (bookable) {
							bookable.requested = 1;
						});
						return true;
					}

					showMessage("dates_in_past");
					return false;
				}
			}
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
