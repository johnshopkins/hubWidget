var jqExists = function (version) {
	
    var existingVersion = window.jQuery && jQuery.fn.jquery;
 
    if (!existingVersion) return false;
 
    current = existingVersion.split(".");
    required = version.split(".");
 
    for (var i=0; i<required.length; i++) {
        if (required[i] === "*") return true;
        if (current[i] < required[i]) return false;
    } 
 
    return true;
};