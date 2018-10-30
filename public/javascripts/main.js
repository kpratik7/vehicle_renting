$(document).ready(
    function () {
        $('#select_location').on('change', function () {
            var location = $(this).val();
            var url = "/users/member/kpratik7/bookvehicle/" + location
            $.ajax({
                type: "GET",
                url: url,
                success: function (results) {
                    var vehicles = JSON.parse(JSON.stringify(results))
                    $('#select_id').empty()
                    if (vehicles.length == 0) {
                        $('<option>').attr({
                                'hidden': 'true',
                                'disabled': 'disabled',
                                'selected': 'selected'
                            })
                            .text('No vehicles to availabe for booking')
                            .appendTo($('#select_id'));
                        $('#book_vehicle').attr('disabled','disabled')
                    } else {
                        for (var i = 0; i < vehicles.length; i++) {
                            $('<option>').attr('value', vehicles[i].vehicle_id)
                                .text(vehicles[i].vehicle_id)
                                .appendTo($('#select_id'));
                        }
                        $('#book_vehicle').removeAttr('disabled','disabled')
                    }
                }
            });
        });
        $('#session_no').on('change', function () {
            $('.session_details').hide()
           var id = '#session_id_'+$(this).val();
           console.log(id)
           $(id).show();
        
        });
        
    })
    function ucfirst(string) {
        return string.charAt(0)+string.substring(1)
    }