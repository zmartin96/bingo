
async function downloadBingoCardsBulk(numberOfCards) {
    const zip = new JSZip(); // Create a new JSZip instance
    const imgFolder = zip.folder("bingo_cards"); // Create a folder in the zip

    for (let i = 0; i < numberOfCards; i++) {
        // Regenerate the bingo card
        generateBingoCard();

        // Wait for the card to render and capture it
        const imgData = await captureBingoCardAsImage();
        const imgBase64 = imgData.split(',')[1]; // Extract base64 part

        // Add the captured image to the ZIP file
        imgFolder.file(`bingo_card_${i + 1}.png`, imgBase64, { base64: true });
    }

    // Generate and download the ZIP file after all cards are processed
    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(content);
        link.download = "bingo_cards.zip";
        link.click();
    });
}

// Function to capture the bingo card as an image
function captureBingoCardAsImage() {
    const bingoCard = document.getElementById('bingo-card');
    var img = new Image();
    return html2canvas(bingoCard, {
        allowTaint: true,
        useCORS: true
    }).then(canvas => {
        img=canvas.toDataURL("image/png");
        //img.src=window.getComputedStyle(bingoCard).backgroundImag;
        img.src=bingoCard.style.backgroundImage;
        return img;
    });
}
    


function resetBingoCard() {
    const cells = document.getElementsByClassName('cell');
    for (let cell of cells) {
        cell.classList.remove('marked');
    }
    unHighlightCells();
    document.getElementById('bingo-message').innerText = '';
    let background = ''; // default background image
    changeBackground(background);
    updateCellSize(120); // default cell size
    document.getElementById('search-bar').value = ''; // clear search bar
    displayPolicyBank(); // display all policies
    document.getElementById('bingo-card').style.backgroundImage = ''; // remove background image
    document.getElementById('cell-size-slider').value = 120; // reset cell size slider
}

function highlightWinningPattern(pattern) {
    const cells = document.getElementsByClassName('cell');
    pattern.forEach(index => {
        cells[index].style.backgroundColor = '#ffeb3b';  // Highlight color
    });
}

function unHighlightCells(){
    const cells = document.getElementsByClassName('cell');
    for (let cell of cells) {
        cell.style.backgroundColor = '';
    }
}

// init bingo card and policy bank
function initialize() {
    displayPolicyBank();
    generateBingoCard();
}

// // call init function when the page is loaded
// document.addEventListener("DOMContentLoaded", () => {
//     if (policiesData.length > 0) {
//         initialize();
//     } else {
//         console.error('Please add policy data to the policiesData array.');
//         document.getElementById('bingo-message').innerText = 'No policy data available. Please add data.';
//     }
// });

//let cellSize = 120; // cell size in pixels

// generate a new bingo card
function generateBingoCard() {
    const bingoCard = document.getElementById('bingo-card');
    bingoCard.innerHTML = '';
    document.getElementById('bingo-message').innerText = '';

    let selectedPolicies = policiesData.sort(() => 0.5 - Math.random()).slice(0, 24);
    selectedPolicies.splice(12, 0, {"Policy": "Insane cabinet picks\n(FREE)", "RelevantQuote": "", "Source": ""});

    selectedPolicies.forEach(policy => {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.innerHTML = `<strong>${policy.Policy}</strong>`;
        cell.title = policy.RelevantQuote ? `${policy.RelevantQuote} (${policy.Source})` : '';
        cell.onclick = () => toggleCell(cell);
        bingoCard.appendChild(cell);
    });
}

// toggle cell marking
function toggleCell(cell) {
    cell.classList.toggle('marked');
    checkForBingo();
    saveState();
}

// check for bingo
function checkForBingo() {
    const cells = document.getElementsByClassName('cell');
    const marked = [...cells].map(cell => cell.classList.contains('marked') ? 1 : 0);

    const winPatterns = [
        [0, 1, 2, 3, 4], [5, 6, 7, 8, 9], [10, 11, 12, 13, 14], [15, 16, 17, 18, 19], [20, 21, 22, 23, 24],
        [0, 5, 10, 15, 20], [1, 6, 11, 16, 21], [2, 7, 12, 17, 22], [3, 8, 13, 18, 23], [4, 9, 14, 19, 24],
        [0, 6, 12, 18, 24], [4, 8, 12, 16, 20]
    ];
    // for multiple bingos
    // let haswon=false;
    // // store winning patterns to highlight
    // let patterns = [];
    // // for each win pattern, check if all cells are marked
    // for (let pattern of winPatterns) {
    //     if (pattern.every(index => marked[index] === 1)) {
    //         patterns.push(pattern); // store winning pattern
    //         haswon=true;
    //     }
    // }
    // unHighlightCells(); // unhighlight all cells to remove previous win patterns that are no longer valid
    // if(haswon){
    //     for (let pattern of patterns) {
    //         highlightWinningPattern(pattern); // highlight winning pattern for each win
    //     }
    //     // display bingo message
    //     document.getElementById('bingo-message').innerText = '🎉 Bingo!\nYou won, we all lose! 🎉';
    // }
    // else{
    //     // remove bingo message
    //     document.getElementById('bingo-message').innerText = '';
    // }

    // Reset all highlights
    Array.from(cells).forEach(cell => cell.classList.remove('highlight'));

    let hasWon = false;
    winPatterns.forEach(pattern => {
        if (pattern.every(index => marked[index])) {
            // if(!pattern.every(index => cells[index].classList.contains('highlight'))){
            // pattern.forEach(index => {
            //     if(cells[index].classList.contains('highlight')){
            //         cells[index].classList.remove('highlight');
            //     }
            // });};
            // setTimeout(function(){
            //     pattern.forEach(index => cells[index].classList.add('highlight'));
            // }, 2);
            pattern.forEach(index => cells[index].classList.add('highlight'));
            hasWon = true;
        }
    });

    const message = document.getElementById('bingo-message');
    message.textContent = hasWon ? '🎉 Bingo!\nYou won, we all lose! 🎉' : '';

}

// change background image
function changeBackground(background) {
    document.getElementById('bingo-card').style.backgroundImage = `url(${background})`;
    saveState();
}

// download bingo card as image using html2canvas
function downloadBingoCard() {
    const bingoCard = document.getElementById('bingo-card');
    var img = new Image();
    
    html2canvas(bingoCard, {
        allowTaint: true,
        //changeBackground: true,
        //backgroundImages: true,
        //backgroundImage: window.getComputedStyle(bingoCard).backgroundImage !== 'none' ? window.getComputedStyle(bingoCard).backgroundImage : null,  // Include background
        //backgroundColor: window.getComputedStyle(bingoCard).backgroundImage !== 'none' ? null : 'white',  // Include background
        useCORS: true  // Handle background images loaded from different origins
    }).then(canvas => {
        //var link = document.getElementById('download');
        const link = document.createElement('a');
        img=canvas.toDataURL("image/png");
        //img.src=window.getComputedStyle(bingoCard).backgroundImag;
        img.src=bingoCard.style.backgroundImage;
        //link.backgroundImage = window.getComputedStyle(bingoCard).backgroundImage;
        link.download = 'bingo_card.png';
        link.href = img;
        link.click();
    });
}
// function downloadBingoCard() {
//     const background = document.getElementById('bingo-card').style.backgroundImage;
//     const bingoCard = document.getElementById('bingo-card');
//     const clone = bingoCard.cloneNode(true);

//     // Append the clone off-screen to preserve layout
//     clone.style.position = 'absolute';
//     clone.style.left = '-9999px';
//     document.body.appendChild(clone);

//     html2canvas(clone, {
//         useCORS: true, // Handle external images if needed
//     }).then(canvas => {
//         document.body.removeChild(clone); // Clean up the clone
//         const link = document.createElement('a');
//         const img= new Image();
//         img.src = canvas.toDataURL(background);
//         link.backgroundImage = background;
//         link.download = 'bingo_card.png';
//         link.href = canvas.toDataURL();
//         link.click();
//     });
// }

// filter policy bank based on search query
function filterPolicyBank() {
    const query = document.getElementById('search-bar').value.toLowerCase(); // not case-sensitive
    const filteredPolicies = policiesData.filter(policy =>
        policy.Policy.toLowerCase().includes(query) || policy.RelevantQuote.toLowerCase().includes(query)|| policy.Source.toLowerCase().includes(query)|| policy.SourceLink.toLowerCase().includes(query)
    );
    displayFilteredBank(filteredPolicies);
}

// display all policies in the policy bank
function displayPolicyBank() {
    const policyBank = document.getElementById('policy-bank');
    policyBank.innerHTML = policiesData.map(policy => `
        <div class="policy-item">
            <strong>${policy.Policy}</strong>: ${policy.RelevantQuote}
            (<a href="${policy.SourceLink}" target="_blank">${policy.Source}</a>)
        </div>
    `).join('<br><br>');
}

// display policy bank after filtering
function displayFilteredBank(filteredPolicies) {
    const policyBank = document.getElementById('policy-bank');
    policyBank.innerHTML = filteredPolicies.map(policy => `
        <div class="policy-item">
            <strong>${policy.Policy}</strong>: ${policy.RelevantQuote}
            (<a href="${policy.SourceLink}" target="_blank">${policy.Source}</a>)
        </div>
    `).join('<br><br>');
}

function uploadBackground() {
    const input = document.getElementById('background-upload');
    if (input.files[0]) {
        const reader = new FileReader();
        reader.onload = e => changeBackground(e.target.result);
        reader.readAsDataURL(input.files[0]);
    }
}

function updateCellSize(size) {
    document.documentElement.style.setProperty('--cell-size', `${size}px`);
    document.getElementById('cell-size-display').textContent = `${size}px`;
    // document.getElementById('bingo-card').style.gridAutoRows = `${size}px`;
    // document.getElementById('bingo-card').style.gridAutoColumns = `${size}px`;
    // document.getElementById('cell').style.height = `${size}px`;
    // document.getElementById('cell').style.width = `${size}px`;
    saveState();
}

function saveState() {
    const cells = document.getElementsByClassName('cell');
    const state = {
        background: document.getElementById('bingo-card').style.backgroundImage,
        cellSize: document.getElementById('cell-size-display').textContent
    };
    localStorage.setItem('bingoState', JSON.stringify(state));
}

function restoreState() {
    const state = JSON.parse(localStorage.getItem('bingoState'));
    if (state) {
        changeBackground(state.background);
        updateCellSize(parseInt(state.cellSize));
        generateBingoCard();
        displayPolicyBank();
        checkForBingo();
    }
}

document.addEventListener('DOMContentLoaded', restoreState);

// policy data
let policiesData = [
    {
        "Policy": "Processing Fees for Asylum Seekers",
        "RelevantQuote": "The Trump administration’s proposal would impose a new fee for asylum seekers, dramatically increase existing fees, and eliminate many fee waivers.",
        "Source": "AFSC",
        "SourceLink": "https://archive.is/vrupo"
    },
    {
        "Policy": "Merge Bureau of Labor Statistics with Census Bureau",
        "RelevantQuote": "Not explicitly quoted but implied under administrative restructuring proposals.",
        "Source": "Project 2025",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Replace Department of State Employees in Leadership by 2025",
        "RelevantQuote": "The next conservative Administration must replace leadership roles across federal agencies.",
        "Source": "Project 2025",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Support Arctic Drilling",
        "RelevantQuote": "Reinstate Trump’s plan for opening most of the National Petroleum Reserve of Alaska to leasing and development.",
        "Source": "Project 2025 (Page 524)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "National Flood Insurance Program Eliminated",
        "RelevantQuote": "The NFIP should be wound down and replaced with private insurance starting with the least risky areas currently identified by the program.",
        "Source": "Project 2025 (Page 154)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Downsize EPA",
        "RelevantQuote": "Limit EPA’s reliance on general rulemaking authority to ensure it is not abused to issue regulations for which EPA lacks substantive authority.",
        "Source": "Project 2025 (Page 426)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Banning TikTok",
        "RelevantQuote": "Address TikTok’s threat to U.S. national security. A new Administration should ban the application on national security grounds.",
        "Source": "Donald Trump Website",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Encouraging Allies to Use Fossil Fuels",
        "RelevantQuote": "Trump’s second-term energy strategy emphasizes promoting fossil fuel-based energy solutions over renewable energy.",
        "Source": "Project 2025",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Block Expansion of National Electrical Grid",
        "RelevantQuote": "FERC initiatives to facilitate long-range transmission lines undermine state input and decision-making.",
        "Source": "Project 2025 (Page 406)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Restrict Stricter Vehicular Emissions by States",
        "RelevantQuote": "Restore the position that California’s waiver applies only to issues like ground-level ozone, not global climate issues.",
        "Source": "Project 2025 (Page 427)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Prevent CDC from Issuing Public Health Advice",
        "RelevantQuote": "CDC guidelines are informative, not prescriptive, and should not dictate national policy.",
        "Source": "Project 2025 (Page 454)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Ban Confucius Institutes",
        "RelevantQuote": "Confucius Institutes, TikTok, and any other arm of Chinese propaganda and espionage should be outlawed.",
        "Source": "Project 2025 (Page 13)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Eliminate Office of Environmental Justice",
        "RelevantQuote": "Not explicitly quoted in reviewed sections but aligns with environmental rollbacks under Project 2025.",
        "Source": "Project 2025",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Banning Any Gender-Affirming Care",
        "RelevantQuote": "HRSA should withdraw all guidance encouraging Ryan White HIV/AIDS Program service providers to provide gender-affirming care.",
        "Source": "Project 2025 (Page 486)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Restrict Federal Disaster Relief for States Violating Immigration Laws",
        "RelevantQuote": "Congress should change the cost-share arrangement so that the federal government covers 25% for small disasters, incentivizing states to comply with immigration policies.",
        "Source": "Project 2025 (Page 154)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Eliminate National Institutes of Health Research on Embryonic Stem Cells",
        "RelevantQuote": "NIH must not be allowed to use federal funding for controversial embryonic research.",
        "Source": "Project 2025",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Terminate DEI Programs and Pursue Anti-White Racism Cases",
        "RelevantQuote": "The next Administration should eliminate every one of these wrongful and burdensome ideological projects related to Diversity, Equity, and Inclusion (DEI).",
        "Source": "Project 2025 (Page 582)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Simplify Individual Income Taxes to Two Flat Tax Rates",
        "RelevantQuote": "Introduce two flat tax rates to simplify and reduce the burden of individual income taxes.",
        "Source": "General Trump Campaign Promise",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Institute Work Requirements for SNAP",
        "RelevantQuote": "The Trump Administration proposed a Supplemental Nutrition Assistance Program (SNAP) rule to increase program integrity and reduce fraud, waste, and abuse.",
        "Source": "Project 2025 (Page 477)",
        "SourceLink": "https://www.project2025.org/policy/"
    },
    {
        "Policy": "Census Citizenship Question",
        "RelevantQuote": "Any successful conservative Administration must include a citizenship question in the census.",
        "Source": "Project 2025 (Page 681)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Abolishing the Department of Education",
        "RelevantQuote": "It is critical that the next Administration tackle this entrenched infrastructure.",
        "Source": "Project 2025 (Page 324)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Explicitly Rejecting Abortion as Healthcare",
        "RelevantQuote": "Abortion is not health care, and states should be free to devise and implement programs that prioritize qualified providers.",
        "Source": "Project 2025 (Page 473)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Cut Medicare and Medicaid",
        "RelevantQuote": "Medicaid... has evolved into a cumbersome, complicated, and unaffordable burden.",
        "Source": "Project 2025 (Page 466)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Shrink the Role of the National Labor Relations Board",
        "RelevantQuote": "The NLRB should increase its use of 10(j) injunctive relief...but should ensure these powers are not used to favor union bosses.",
        "Source": "Project 2025 (Page 602)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Infusing Christian Nationalism into Policy",
        "RelevantQuote": "The Judeo-Christian tradition has always recognized fruitful work as integral to human dignity.",
        "Source": "Project 2025 (Page 581)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Use the Comstock Act for Abortion Pill Restrictions",
        "RelevantQuote": "HRSA should eliminate this potential abortifacient from the contraceptive mandate.",
        "Source": "Project 2025 (Page 486)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Rounding Up and Deporting All 'Illegal' Immigrants",
        "RelevantQuote": "Trump plans to revoke Temporary Protected Status for beneficiaries.",
        "Source": "PolitiFact",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Defund Planned Parenthood",
        "RelevantQuote": "Congress should pass the Protecting Life and Taxpayers Act to defund abortion providers such as Planned Parenthood.",
        "Source": "Project 2025 (Page 473)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Title I Expiration",
        "RelevantQuote": "Federal spending should be phased out over a 10-year period, and states should assume decision-making control.",
        "Source": "Project 2025 (Page 350)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Eliminate Head Start",
        "RelevantQuote": "Eliminate the Head Start program.",
        "Source": "Project 2025 (Page 482)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Abolish the Consumer Financial Protection Bureau (CFPB)",
        "RelevantQuote": "Congress should abolish the CFPB and reverse Dodd–Frank Section 1061.",
        "Source": "Project 2025 (Page 839)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Abolish the FTC",
        "RelevantQuote": "Should the FTC Enforce Antitrust—or Even Continue to Exist?",
        "Source": "Project 2025 (Page 873)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Cease All Programs Supporting Gender Transition",
        "RelevantQuote": "We will cease all programs promoting sex and gender transitions at any age.",
        "Source": "Donald Trump Website",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Withdraw from the Paris Climate Accord Again",
        "RelevantQuote": "We will once again withdraw from the Paris Climate Agreement, a disaster for the U.S. economy.",
        "Source": "Archive.is",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Eliminate Funding for NPR",
        "RelevantQuote": "We will eliminate funding for NPR and other public broadcasters that push leftist propaganda.",
        "Source": "Archive.is",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Arrest Homeless People and Send to Tent Cities",
        "RelevantQuote": "We will clean up our cities by building tent cities for the homeless and removing them from public spaces.",
        "Source": "Archive.is",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Restrict Voting to One Day",
        "RelevantQuote": "We will eliminate extended voting periods and require all voting to take place on Election Day only.",
        "Source": "Rev.com",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "10% Tariff on All Foreign Goods",
        "RelevantQuote": "We will institute a 10% universal tariff on all imports to protect American jobs and industries.",
        "Source": "Fox Business",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "25% Tariff on Cars from Mexico",
        "RelevantQuote": "We will impose a 25% tariff on vehicles from Mexico to incentivize American production.",
        "Source": "Archive.is",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Eliminate Imports of Goods from China",
        "RelevantQuote": "We will adopt a four-year plan to phase out all Chinese imports of essential goods to strengthen American manufacturing.",
        "Source": "Archive.is",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Construct Iron Dome-like Missile Defense System",
        "RelevantQuote": "We will build an Iron Dome-style missile defense shield to protect the U.S. from incoming threats like hypersonic missiles.",
        "Source": "Donald Trump Website",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Withdraw the U.S. from WHO",
        "RelevantQuote": "We will completely withdraw from the World Health Organization, which has been a disaster for the U.S.",
        "Source": "C-SPAN",
        "SourceLink": "https://www.project2025.org/policy/2"
    },    
    {
        "Policy": "Use public, taxpayer money for private religious schools",
        "RelevantQuote": "We will clean up our cities by building tent cities for the homeless and removing them from public spaces.",
        "Source": "Project 2025",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Teachers can not call students nicknames or use preferred pronouns",
        "RelevantQuote": "No public education employee or contractor shall use a name to address a student other than the name listed on a student’s birth certificate, without the written permission of a student’s parents or guardians.",
        "Source": "Project 2025 (Page 346)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Prevent the cancellation of student debt",
        "RelevantQuote": "The new Administration should urge the Congress to amend the HEA to abrogate, or substantially reduce, the power of the Secretary to cancel, compromise, discharge, or forgive the principal balances of Title IV student loans",
        "Source": "Project 2025 (Page 354)",
        "SourceLink": "https://www.project2025.org/policy/2"
    },
    {
        "Policy": "Redirect education funding to foreign",
        "RelevantQuote": "require the Secretary of Education to allocate at least 40 percent of funding to international business programs that teach about free markets and economics and require institutions, faculty, and fellowship recipients to certify that they intend to further the stated statutory goals of serving American interests",
        "Source": "Project 2025 (Page 356)",
        "SourceLink": "https://www.project2025.org/policy/2"
    }
    // {
    //     "Policy": "",
    //     "RelevantQuote": "",
    //     "Source": "",
    //     "SourceLink": ""
    // }
];