// correct user-entered timestamps corresponding to measures in a song
// by Chris Wilson

// input is an array of N timestamps created by periodic keystrokes. We do
// not know how many beats there were supposed to be


function correct(stamps) {    
    var total = {};
    
    // object to return
    var values = {};
    var avg = Math.round(stamps[stamps.length - 1] / stamps.length);
    values.user = avg;
    total.user = stamps.length;
    
    // first, we can detect missed beats from user by abnormally long intervals    
    // if we discover unusually long beats, they must surpass this ratio to be considered a double beat
    var MISSED_BEAT_DETECTOR = 1.5;
    // remember that every missed beat ups the average, so this can't be too high
    // The maximum error on either side of non-missed beats is (MISSED_BEAT_DETECTOR - 1) / 2
    // e.g., a regular beat that's early on the front and late on the back could appear to be a missed beat outside this margin
    
    var c = 1; 
    while (c < stamps.length) {
        var interval = stamps[c] - stamps[c - 1];
        if (interval / avg > MISSED_BEAT_DETECTOR) {
            console.log("Detected a missed beat at position " + c);
            stamps.splice(c, 0, stamps[c - 1] + interval / 2);
            avg = Math.round(stamps[stamps.length - 1] / stamps.length);
        } else {
            c += 1;
        }
    }

    values.avg = avg;
    total.avg = stamps.length;

    // starting with the average value, we're going to adjust the value until the error is a minimum
    // we'll try it in both directions a pick whichever one we like better    
    var lower = narrow(stamps, avg, -1);    
    var upper = narrow(stamps, avg, 1);        
    values.guess = lower[1] < upper[1] ? lower[0] : upper[0];
    total.guess = stamps.length;
    return {
        values: values,
        total: total
    };
}

// horribly unoptimised 
function narrow(setA, val, step) {
    var m = mean_sq_error(setA, val);    
    while (val > 0) {
        var t = mean_sq_error(setA, val + step);
        if (t < m) {
            val += step;
            m = t;
        } else {
            break;
        }
    }
    return [val, m];
}

//assumes set size is equal
function mean_sq_error(setA, val) {
    var sum = 0;
    var setB = [];
    //make test set
    for (var c = 1; c <= setA.length; c += 1) {
        setB.push(c * val);
    }
    for (c = 0; c < setA.length; c += 1) {
        //console.log(setA[c] - setB[c]);
        //sum += Math.abs(Math.pow(setA[c] - setB[c], 1));
        sum += Math.pow(setA[c] - setB[c], 2);
    }
    return sum;
}
