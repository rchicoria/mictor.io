
function urinalgorithm(n, urinal_array){
  var max_uri = [];
  var max_dist = 0;
  var tot_dist = [];
  var left_d = 0;
  var right_d = 0;
  var i = 0;

  for(i = 0; i < n; i++){
    console.log('Urinal ', i)
    //left side
    if(urinal_array[i] == 0){
      if(i == 0){
        left_d = n-1;
        console.log('Left distance', left_d);
        //first urinol left distance is max distance
      }else{
        for(l = i-1; l > -1; l--){
            if(urinal_array[l] == 1){ //is occupied
              left_d = i-l-1;
              console.log('Left distance', left_d);
              break;
            }
            if(l == 0){
              left_d = i;
              console.log('Left distance', left_d);
            }
        }
      }
      //right side
      if(i == n-1){
        right_d = n-1;
        console.log('Right distance', right_d);
        //last urinol right distance is max distance
      }else{
        for(r = i+1; r < n; r++){
            if(urinal_array[r] == 1){ //is occupied
              right_d = r-1-i;
              console.log('Right distance', right_d);
              break;
            }
            if(r == n-1){
              right_d = n-1-i;
              console.log('Right distance', right_d);
            }
        }
      }
    }
    if(right_d == 0 || left_d == 0){ //if its next to someone
      tot_dist.push(0);
    }else {
      tot_dist.push(right_d+left_d);
      if (tot_dist[i] > max_dist){
        max_uri = [];
        max_uri.push(i);
        max_dist = tot_dist[i];
      }else if(tot_dist[i] == max_dist && max_dist != 0){
        max_uri.push(i);
      }
    }
    console.log('total distance ', tot_dist[i])
    left_d = 0;
    right_d = 0;
  }

  if(max_dist == 0){ //saturated situation
    max_uri = [];
    for(i = 0; i < n; i++){
      if(urinal_array[i] == 0){
        max_uri.push(i);
      }
    }
  }

  return max_uri;

}

//var urinal_array = [1,1,0,1,0,1];
var urinal_array = [1,1,1,1,1,1];
var n = 6;
var max_uri = []

max_uri = urinalgorithm(n, urinal_array);
console.log(max_uri);
