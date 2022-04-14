const URL = "http://localhost:8000/items";

function getAllItems(callback) {
  let xhr = new XMLHttpRequest();
  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        let res = JSON.parse(xhr.responseText);
        callback(res);
      } else {
        console.log('Error --- Status: ' + xhr.status + " | Description: " + xhr.responseText);
        callback(null);
      }
    }
  }
  xhr.open("GET", URL, true);
  xhr.send();
}

function createOrUpdateItem(item, addUpdate, callback) {
  //console.log(item)
  const url = `${URL}/${item.id}`;
  //console.log(url)
  const method = addUpdate === "Adding" ? "POST" : "PUT";
  //console.log(method)
  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      console.log(xhr.status)
      if (xhr.status === 200 || xhr.status === 201) {
        console.log(`completed ${addUpdate}`)
        callback(JSON.parse(xhr.responseText));
      } else {
        callback(null);
        console.log('Error --- Status: ' + xhr.status + " | Description: " + xhr.responseText);
      }
    }
  }

  xhr.open(method, url, true);
  xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
  xhr.send(JSON.stringify(item));
}

function deleteItem(id, callback) {
  let url = `${URL}/${id}`;
  let xhr = new XMLHttpRequest();

  xhr.onreadystatechange = () => {
    if (xhr.readyState === XMLHttpRequest.DONE) {
      if (xhr.status === 200) {
        callback(JSON.parse(xhr.responseText));
      } else {
        console.log('Error --- Status: ' + xhr.status + " | Description: " + xhr.responseText);
        callback(null);
      }
    }
  }  
  xhr.open("DELETE", url, true);
  xhr.send();
}


export { deleteItem, getAllItems, createOrUpdateItem };