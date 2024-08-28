const textarea = document.querySelector("textarea");
const result = document.querySelector(".result");
const count = document.querySelector("#count");
let sentences;
let stringsCoresspondingIndx;
/*
  1 => reds
  2 => blues
  3=> greens
  4 => publes
  5 => oranges
*/ 

const color_groups = {
  1 :{colors:(coeff)=> GenerateRandomHexColor(0xFF000080 , 0xFF0000FF ,"red" , coeff) ,  indx : new Set()},
  2 :{colors:(coeff)=> GenerateRandomHexColor(0x0000FF80 , 0x0000FFFF ,"blues" , coeff),  indx : new Set()},
  3 :{colors:(coeff)=> GenerateRandomHexColor(0x00FF0080 , 0x00FF00FF, "greens" , coeff) ,  indx : new Set()},
  4 :{colors:(coeff)=> GenerateRandomHexColor(0x80008080 , 0x800080FF, "publes" , coeff) ,  indx : new Set()},
  5 :{colors:(coeff)=> GenerateRandomHexColor(0xFFA50080 , 0xFFA500FF, "oranges" , coeff) ,  indx : new Set()},
  
 }


 textarea.onchange = function(e){
  // split sentences into array
  const regex = /\.\s|,\s|,|\.|\!|\!\s|\?|\?\s/
  sentences = e.target.value.split(regex);
  
  if(sentences.length > 100){
    console.log("Sentences exceeds")
    return;
  }

  // before sorting i store index of each sentence in original paragraph
  sentences = sentences.map((sentenceItSelf , OldIndex)=>{ return { sentenceItSelf:sentenceItSelf , OldIndex:OldIndex}})
  // we sort sentences by length so sentences with same length are neighbours
  sentences.sort((a , b) => a.sentenceItSelf.length - b.sentenceItSelf.length);
  console.log("after sorting sentences" , sentences)
  // length threshold is used to make sure before comparing words that sentences are 70% identical in length so one could be twice in length as the other and still be checked for word similarity
  let lengthThreshold = 80;

  let leftPointer = 0 ;
  let rightPointer = 1;
  let colorpointer = 1; // points to current color group
  let coeff  = 0;
  // left pointer can reach to the second element from the right
  // right pointer can reach end of array
  while(leftPointer < sentences.length - 1 && rightPointer < sentences.length ){
    console.log("------------------------------------------------------------------------------")
    Object.keys(color_groups).forEach(key => {
      console.log(`Group ${key}:`, [...color_groups[key].indx]);
  });
    // due to sorting bigger sentence will always be at the rightPointer so we divide leftPointer / rightPointer
    const LengthSimilarity = (sentences[leftPointer].sentenceItSelf.length / sentences[rightPointer].sentenceItSelf.length) * 100;

    if(LengthSimilarity >= lengthThreshold){
      
      // here w check the words similarity & if similar we colorize
      // if similar words we highligh
      isAccepted = wordsChecking(sentences[leftPointer].sentenceItSelf , sentences[rightPointer].sentenceItSelf)
      console.log("isAccepted",isAccepted , leftPointer , rightPointer , "colorpointer",colorpointer)
      if(isAccepted){
        // we push indxes of similar strings
        // checking that sentence index wasn't added before if not then add it
        console.log()
        if(!color_groups[colorpointer].indx.has(leftPointer))
          color_groups[colorpointer].indx.add(leftPointer);
        if(!color_groups[colorpointer].indx.has(rightPointer))
          color_groups[colorpointer].indx.add(rightPointer);
      }
    }
    else{
      // leftPointer Jumps To RightPointer
      leftPointer++;
      rightPointer = leftPointer; // right will be incremented at the end of the loop te be ahead of left pointer as it was
      coeff +=2
      // if rejected by length threshold change color group so sentences with near length are in same group
      colorpointer = colorpointer < Object.keys(color_groups).length ? ++colorpointer : 1 ; // first group key is 1
    }

    rightPointer++; // is added by 1 anyways
    

  }

  // starting to insert span highlight to sentences
  sentences = Highlighter(sentences ,coeff)

  // rearrange sentences back to they were by index
  sentences.sort((a , b)=> a.OldIndex - b.OldIndex)

  // we map to get sentenceItSelf as new array then join them
  const resultText =sentences.map(sentence => sentence.sentenceItSelf).join("\n");
  result.innerHTML = resultText
  
}


function wordsChecking(leftString , rightString){
  const leftSet = new Set(leftString.split(" ")); // creating a set of unique words from leftString

  const rightArr = rightString.split(" ");

  const wordsThreshold = 40; // % of words are similar
  let similarWordsCounter = 0;

  rightArr.forEach(word =>{
      if(leftSet.has(word)){
        similarWordsCounter++;
      }
      else{
        return;
      }
  })
  console.log("similarWordsCounter",similarWordsCounter , (similarWordsCounter/rightArr.length) * 100)
  // knowing that rightString is always the larger one or equal due to sorting
  // so we chech words similar / total words of longer one to get percentage
  return ((similarWordsCounter/rightArr.length) * 100) >=wordsThreshold;

}


function Highlighter(sentences ,coeff){
    return sentences.map((sentence ,sentenceIndex) => {
    // either we use hex color returned by HasIndx or GenerateRandomHexColor
    return{ sentenceItSelf :`<span style="background-color:${HasIndx(sentenceIndex , coeff) ||  GenerateRandomHexColor(0xD3D3D38F , 0xD3D3D3FF ,"has not") };">${sentence.sentenceItSelf}</span>` , OldIndex: sentence.OldIndex}
  });
}

function HasIndx(sentenceIndex ,coeff){
  // check if any color group has that index stating from key 1 group
  for(let i = 1 ; i <= Object.keys(color_groups).length ; i++){
      // if indx assigned to certain group return indx of that group
      if(color_groups[i].indx.has(sentenceIndex)){
        // this returns hex of random color indx from 0 to colors array last indx
        return color_groups[i].colors(coeff);
      }
  }
    return false
  
}

// coeff with default val of 0
function GenerateRandomHexColor(min, max , group , coeff = 0) {
  // Ensure min and max are within valid hex color bounds (0x000000 to 0xFFFFFF)
  if (min < 0x00000000 || max > 0xFFFFFFFF || min > max) {
      throw new Error("Invalid range for hex color generation");
  }
  console.log("group" , group)
  // Generate a random number between min and max
  const randomColor = Math.floor(Math.random() * (max - min + 1)) + min + coeff * 0x00010000;

  // Convert the random number to a hex string and pad with leading zeros if necessary
  const hexGenerated = randomColor.toString(16).padStart(8, '0'); // 8 charcters extra 2 are for opacity

  return `#${hexGenerated}`;
}

