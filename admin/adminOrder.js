const mainPanel = document.getElementById('order-container');


let imgAddress = "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/800px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg";
// newContent()
function newContent(clientName, igUsername, mobile, address, imgAddress){
   mainPanel.innerHTML = `
        <div class="container-details">
                    <span>ORDER #123456</span>
                    <span>Status</span>
                    <span>Size 14x7 inches</span>
                    <div>Name: ${clientName}</div>
                    <div>Instagram Username: ${igUsername}</div>
                    <div>Mobile Number: ${mobile}</div>
                    <div>Address: ${address}</div>
                </div>
                <div class="container-2">
                    <div class="container-picture">
                        <div class="image-container">
                            <img src="${imgAddress}" >
                        </div>
                        <button>Download Image</button>
                    </div>
                    <div class="container-notes">
                        Notes:
                        <div class="customer-notes">
                            hello worlddddd<br>
                            hello worlddddd<br>hello worlddddd<br>hello worlddddd<br>hello worlddddd<br>hello worlddddd<br>
                        </div>
                    </div>
                </div>
                <form action="">
                    <div class="container-upload">
                        <div>Upload delivery tracking number</div>
                        <span>
                            <input type="file" name="tracking" id="tracking">
                        </span>
                        or
                        <span>Tracking Number:
                            <input type="text">
                        </span>
                        <span>
                           Delivery Courier:
                            <select name="delivery" id="delivery">
                                <option value="lalamove">Lalamove</option>
                                <option value="grab">Grab</option>
                                <option value="lbc">LBC</option>
                            </select>
                        </span>
                    </div>
                    <div class="container-buttons">
                        <button class="cancel-order">Cancel Order</button>
                        <button class="complete-order">Complete Order</button>
                    </div>
                </form>
    `
}

const newOrderButton = document.querySelector('#create');

newOrderButton.addEventListener('click', ()=>{
    let clientName = "Julius Austin S. Santos";
    let igUsername = "@julssantos";
    let mobile = "09664282161";
    let address = "Los Angeles, California";
    console.log('gumagana ako');
    
    const sideTab = document.querySelector('.order-preview');
    const orderTab = document.createElement('div');
    orderTab.classList.add('order-scroll');
    sideTab.appendChild(orderTab);
    orderTab.innerHTML += `
    
        <div class="order-id-tab">Order#696969</div>
            <div class="order-id-content">
                <div class="img-container"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/7a/LeBron_James_%2851959977144%29_%28cropped2%29.jpg/800px-LeBron_James_%2851959977144%29_%28cropped2%29.jpg" alt="" width="100%"></div>
                <div class="order-details">
                    hehdshshd
                    dsdasda
                    
                </div>
            </div>
        </div>
    `
    // const order = document.querySelector('.order-scroll');
    //delete item
    orderTab.addEventListener('dblclick', ()=>{
        // innerContainer.classList.add('animation-end');
        setTimeout(()=>sideTab.removeChild(orderTab),700);
    })

    //whole preview
    orderTab.addEventListener('click', ()=>{
        newContent(clientName, igUsername, mobile, address, imgAddress);
    })
})
