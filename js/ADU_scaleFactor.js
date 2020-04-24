function scaleDict(dict, k) {
  for(var key in dict)
    dict[key] *= k;
  return dict;
}

//testing
/*dict1 = {fruit: 100, animal: 100};

console.log(scaleDict(dict1, 10));*/
