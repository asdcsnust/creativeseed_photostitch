$(function() {
  $("#files").change(function() {
    var files = Array.prototype.slice.call(this.files);
    files.sort();
    if (files && files[0]) {
      for (var i = 0; i < files.length; i++) {
        var reader = new FileReader();
        reader.onload = imagesIsLoaded;
        reader.readAsDataURL(files[i]);
      }
    }
  });
});

function imagesIsLoaded(ev) {
  $("#selected-image").append("<img src =" + ev.target.result + ">");
}
