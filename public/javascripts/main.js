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
            $('.session-container-body').hide()
           var id = '#session_id_'+$(this).val();
           $(id).show();
        
        });

        $('.session_date').each(function () {
            var tempDate = new Date(Date.parse($(this).text()));
            $(this).text(tempDate)
            
        })
        $('#login-form').validate({
            rules:{
                name :{
                    required: true,
                    minlength:5
                },
                email: {
                    required: true,
                    email:true
                },
                username: {
                    required:true,
                    minlength:5
                },
                password:{
                    required:true,
                    minlength:5
                },
                password2: {
                    required:true,
                    equalTo:'#password'
                }
            },
            messages:{
                name:{
                    required:'Name required.',
                    minlength:'Name should atleast contain 5 characters.'
                },
                email:{
                    required:'E-mail required.',
                    email:'Please Enter a valid E-mail address.'
                },
                username:{
                    required:'Username required.',
                    minlength:'Username should alteast contain 5 characters.'
                },
                password:{
                    required:'Password required.',
                    minlength:'Password should atleast contain 5 characters.'
                },
                password2:{
                    required:'Enter password again.',
                    equalTo:'Please Enter the same password as above.'
                }
            }
        })
    })
    