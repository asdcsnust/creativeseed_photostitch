$(function() {
  $("#files").change(function() {
    var files = Array.prototype.slice.call(this.files);
    files.sort();
    if (files && files[0]) {
      for (var i = 0, f; (f = files[i]); i++) {
        (function() {
          var img = $("<img/>");
          var reader = new FileReader();
          $("#selected-image").append(img);
          reader.onload = function(e) {
            img.attr("src", e.target.result);
          };
          reader.readAsDataURL(f);
        })();
      }
    }
  });
});
