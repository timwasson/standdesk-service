$.fn.serializeObject = function() {
  var o = {};
  //var a = this.serializeArray();
  $(this).find('input[type="hidden"], input[type="text"], input[type="password"], input[type="checkbox"]:checked, input[type="radio"]:checked, select').each(function() {
      if ($(this).attr('type') == 'hidden') { //If checkbox is checked do not take the hidden field
          var $parent = $(this).parent();
          var $chb = $parent.find('input[type="checkbox"][name="' + this.name.replace(/\[/g, '\[').replace(/\]/g, '\]') + '"]');
          if ($chb != null) {
              if ($chb.prop('checked')) return;
          }
      }
      if (this.name === null || this.name === undefined || this.name === '')
          return;
      var elemValue = null;
      if ($(this).is('select'))
          elemValue = $(this).find('option:selected').val();
      else
          elemValue = this.value;
      if (o[this.name] !== undefined) {
          if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
          }
          o[this.name].push(elemValue || '');
      }
      else {
          o[this.name] = elemValue || '';
      }
  });
  return o;
}
var SecondsTohhmmss = function(totalSeconds) {
  var hours   = Math.floor(totalSeconds / 3600);
  var minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
  var seconds = totalSeconds - (hours * 3600) - (minutes * 60);

  // round seconds
  seconds = Math.round(seconds * 100) / 100

  var result = (hours < 10 ? "0" + hours : hours);
    result += ":" + (minutes < 10 ? "0" + minutes : minutes);
    result += ":" + (seconds  < 10 ? "0" + seconds : seconds);
  return result;
}

$( document ).ready(function() {
  // Handler for .ready() called.
  console.log("Ready!");
  $("button#save").on("click", function(e) {
    e.preventDefault();
    console.log($("form").serialize());
    
    var frm = $("form");
    var saveData = frm.serializeObject();
    
    console.log(saveData);
    
    $.ajax({
      method: "POST",
      url: "/save",
      data: saveData 
    })
    .done(function( msg ) {
      console.log( msg );
    });
  });
  $("button#upPress").on("click", function() {
    $.ajax("http://10.164.116.27:3000/up");  });
  $("button#downPress").on("click", function() {
    $.ajax("http://10.164.116.27:3000/down");
  $("button#Pause").on("click", function() {
    $.ajax("http://10.164.116.27:3000/pause");  });
  $("button#unPause").on("click", function() {
    $.ajax("http://10.164.116.27:3000/unpause");  });
  });
  setInterval(function() {
    $.getJSON("status", function(data){
      var timeRem = data.timeRemain;
      timeRem = SecondsTohhmmss(timeRem);
      $("#status span").html(data.status);
      $("#clock").html(timeRem);
      $("#height").html(Math.round(data.distance) + " cm");
      console.log(data);
    })
  }
  , 1000);
});
