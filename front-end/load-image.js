$(function() {
  $("#files").change(function() {
    if (this.files && this.files[0]) {
      for (var i = 0; i < this.files.length; i++) {
        var reader = new FileReader();
        reader.onload = imagesIsLoaded;
        reader.readAsDataURL(this.files[i]);
      }
    }
  });
});

function imagesIsLoaded(ev) {
  $("#selected-image").append("<img src =" + ev.target.result + ">");
}
