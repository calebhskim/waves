var users = 0
$(".login").click(function() {
    users += 1;
    console.log(users)
    var userLoggedIn = $(this).parent().attr('id');
    // once they login
    $("#"+ userLoggedIn + " .login").hide();
    $("#"+ userLoggedIn + " .loggedin").css("display","block");
    // something that checks that both uers are logged in
    if (users == 2) {
        $(".container .loggedin").show();
    }
})

$(".test").click(function() {
    $(this).addClass("test-clicked");
    setTimeout(function() {
      $(".test").text("your results").fadeIn();
    }, 700);

    // progressbar.js@1.0.0 version is used
    // Docs: http://progressbarjs.readthedocs.org/en/1.0.0/

    var bar = new ProgressBar.Circle('#percentage', {
    color: '#fff',
    // This has to be the same size as the maximum width to
    // prevent clipping
    strokeWidth: 3,
    trailWidth: 1,
    easing: 'easeOut',
    duration: 2500,
    text: {
      autoStyleContainer: false
    },
    from: { color: '#aee4ff', width: 1 },
    to: { color: '#e3aeff', width: 3 },
    // Set default step function for all animate calls
    step: function(state, circle) {
        circle.path.setAttribute('stroke', state.color);
        circle.path.setAttribute('stroke-width', state.width);

        var value = Math.round(circle.value() * 100);
        if (value === 0) {
          circle.setText('');
        } else {
          circle.setText(value+"%");
        }

      }
    });

    bar.text.style.fontFamily = '"Raleway", Helvetica, sans-serif';
    bar.text.style.fontSize = '8rem';

    bar.animate(0.8);  // Number from 0.0 to 1.0
    // end progress bar

    $("#percentage").fadeIn();
    $("#percentage").addClass("percentage-up");
    $("#user1").addClass("push-left");
    $("#user2").addClass("push-right");
});
