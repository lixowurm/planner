console.log("distanceCalculator.js loaded");
console.log("Axios:", typeof axios);

let chairCostValue = 0;
let distance = 0;
let distanceCost = 0;
let distanceCostValue = 0;
let totalCost = 0;
let totalCostOutput;
let netto = 0;
let loadingCost = 0;

let kmPrice = 250;
let chairPrice = 990;
let loadingPrice = 500;
let tax = 0.27;
let chairLimit = 200;

class DistanceCalculator {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        //this.addressHandler = new Address();

        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found.`);
            return;
        }

        this.render();
        this.setupEvents();
    }

    render() {
        this.container.innerHTML = `
<h1>Àrkalkulátor</h1>
<div class="toggle-list">
    <div class="toggle-content">
      <div class="input-container">
       <input type="number" id="addressInput" placeholder="IRÀNYITÓSZÀM">
       <span id="distanceCost"></span>
       <p id="foundAddress" style="font-size: small;"></p>
      </div>
      <div class="input-container">
       <input type="number" id="chairInput" placeholder="SZÈK DB">
       <span id="chairCost"></span>
      </div>
    </div>
</div>


</div>

<div class="input-container">

</div>
<div class="button-container">
    <button id="submitButton">KISZÀMOLÀS</button>
</div>

<button id="toggleListButton">Show/Hide Details</button>

<ul id="outputList" class="output-container">
    <li id="distanceContainer">
        <p id="distanceOutput"></p>
    </li>
    <li id="chairContainer">
        <p id="chairOutput"></p>
    </li>
    <li id="loadingContainer">
        <p id="loadingOutput"></p>
    </li>
    <li id="nettoContainer">
        <p id="nettoOutput"></p>
    </li>
    <li id="taxContainer">
        <p id="taxOutput"></p>
    </li>
    <li id="totalCostContainer">
        <p id="totalCostOutput"></p>
    </li>
</ul>


        `;
    }

setupEvents() {
    const foundAddress = this.container.querySelector('#foundAddress');
    const submitButton = this.container.querySelector('#submitButton');
    const inputElements = this.container.querySelectorAll('input');
    const distanceOutput = this.container.querySelector('#distanceOutput');
    const addressInput = this.container.querySelector('#addressInput');
    totalCostOutput = this.container.querySelector('#totalCostOutput');
    const chairOutput = this.container.querySelector('#chairOutput');
    const loadingOutput = this.container.querySelector('#loadingOutput');
    const taxOutput = this.container.querySelector('#taxOutput');
    const nettoOutput = this.container.querySelector('#nettoOutput');
    const toggleContent = this.container.querySelector('.toggle-content');

    // Blur event listener for address input
    addressInput.addEventListener('blur', () => {
        this.calculate(addressInput);
    });

    // Function to handle delayed calculation for other inputs
    let timeoutId;
    const delay = 500; // Adjust delay time as needed

    // Input event listener for other input elements
    inputElements.forEach(input => {
        if (input !== addressInput) {
            input.addEventListener('input', () => {
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => {
                    this.calculate(input);
                }, delay);
            });
        }
    });

    // Click event listener for the submit button
    submitButton.addEventListener('click', async () => {
        this.calculate();
        totalCost = distanceCostValue + chairCostValue + loadingCost;
        distanceOutput.textContent = `+${Math.floor((distance*4) * kmPrice).toLocaleString()} Ft (Szállítás 2x oda-visza: ${Math.floor(distance*4)} km, ${kmPrice} Ft/km)`;
        totalCostOutput.innerHTML = `=<span class="bold">${Math.floor(totalCost * (tax + 1)).toLocaleString()} Ft</span> Teljes költség.`;
        chairOutput.textContent = `+${Math.floor(chairCostValue).toLocaleString()} Ft (Székbérlés: ${chairPrice}/db)`;
        loadingOutput.textContent = `+${Math.floor(loadingCost).toLocaleString()} Ft (Rakodás költség: ${loadingPrice} Ft/db szék)`;
        nettoOutput.textContent = `=${(Math.floor(totalCost)).toLocaleString()} Ft (nettó ár)`;
        taxOutput.textContent = `+${(Math.floor(totalCost * tax)).toLocaleString()} Ft (ÁFA: ${tax * 100}%)`;

        // Hide the toggle content when the submit button is pressed
        toggleContent.style.display = 'none';
    });

    // Toggle list visibility
    const toggleListButton = document.getElementById('toggleListButton');
    toggleListButton.style.display = 'none'; // Hide the toggle button
    submitButton.addEventListener('click', () => {
        addressInput.disabled = true;
        chairInput.disabled = true;
        const outputList = document.getElementById('outputList');
        outputList.style.display = (outputList.style.display === 'none' || outputList.style.display === '') ? 'block' : 'none';
    });
}



async calculate(triggeredInput = null) {
    const addressInput = this.container.querySelector('#addressInput');
    const chairInput = this.container.querySelector('#chairInput');
    const chairCostOutput = this.container.querySelector('#chairOutput');
    const distanceOutput = this.container.querySelector('#distanceOutput');
    const distanceCost = this.container.querySelector('#distanceCost');
    const chairCost = this.container.querySelector('#chairCost');
    const totalCostOutput = this.container.querySelector('#totalCostOutput');
    const loadingOutput = this.container.querySelector('#loadingOutput');
    const taxOutput = this.container.querySelector('#taxOutput');
    const nettoOutput = this.container.querySelector('#nettoOutput');

    const destination = addressInput.value.trim();
    let numberOfChairs = parseInt(chairInput.value, 10);

    // Calculate and display distance only on address input blur event
if (triggeredInput === addressInput && destination) {
    try {
        const response = await axios.post('http://192.168.178.62:5000/checkAddress', { destination: destination });
        const addressData = response.data;

        if (addressData.display_name !== "null" && addressData.display_name !== "ill") {
            addressInput.disabled = false;
            addressInput.classList.remove('dataNotCorrect');
            addressInput.classList.add('dataCorrect');

            const addressInfo = addressData.city ? `${addressData.city}, ${addressData.suburb}, ${addressData.postcode} ${addressData.country}` : `${addressData.town}, ${addressData.suburb}, ${addressData.postcode} ${addressData.country}`;
            foundAddress.textContent = addressInfo;

            const origin = [47.18319, 18.42490];
            const destinationCoordinates = addressData.coordinates;
            const response = await axios.post('http://192.168.178.62:5000/getDistance', {origin: origin, destination: destinationCoordinates
 
});
            distance = response.data.distance;
            distanceCostValue = (distance * 4) * kmPrice;
            this.startAnimation(distanceCost, distanceCostValue, true);

            // Display the distance
            distanceOutput.textContent = `+${Math.floor((distance * 4) * kmPrice).toLocaleString()} Ft (szállítás 2x oda-visza: ${Math.floor(distance * 4)} km, ${kmPrice} Ft/km)`;

            // Calculate and display total cost
            totalCost = distanceCostValue + chairCostValue + loadingCost;
            totalCostOutput.innerHTML = `=<span class="bold">${Math.floor(totalCost * (tax + 1)).toLocaleString()} Ft</span> teljes költség.`;
        } else {
            // Display the error message from the API
            distanceOutput.textContent = `${addressData.display_name}`;
            foundAddress.textContent = 'nem helyes az irányitószám!';
            addressInput.classList.add('dataNotCorrect');
            distanceCostValue = 0;
        }
    } catch (error) {
        console.error('Error fetching address information:', error);
    }
}


        // Calculate and display chair cost only on chair input blur event
        if (triggeredInput === chairInput && !isNaN(numberOfChairs)) {
          if(numberOfChairs>chairLimit) {
            alert("200 szék fölött, kérjǘk tegyen fel egyedi ajánlatot.");
           numberOfChairs = chairLimit;
          }  
           chairCostValue = numberOfChairs * chairPrice;
              loadingCost = numberOfChairs * loadingPrice;
                 this.startAnimation(chairCost, chairCostValue, false);
        }
    }



    startAnimation(targetElement, targetValue, bool) {
        const duration = 400; // Change this to adjust animation duration in milliseconds

        const startTime = performance.now();
        const endTime = startTime + duration;

        const updateNumber = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(progress * targetValue);

            let newTextContent;
                newTextContent = `${(currentValue).toLocaleString()} Ft`;

            targetElement.textContent = newTextContent;

            if (currentTime < endTime) {
                requestAnimationFrame(updateNumber);
            }
        };

        requestAnimationFrame(updateNumber);
    }
}

window.DistanceCalculator = DistanceCalculator;
