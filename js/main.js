

const inTitle = document.querySelector("#input-title");
const inPrice = document.querySelector("#input-price");
const inDescription = document.querySelector("#input-description");
const btnCancel = document.querySelector("#button-cancel");

const onClickCancel = (evt) => {
    // Don't navigate to a different page
    evt.preventDefault();

    inTitle.value = "";
    inPrice.value = 80;
    inDescription.value = "";
};

btnCancel.addEventListener("click", onClickCancel);

async function loadListings() {
    const listingsSection = document.querySelector(".listings");
    if (!listingsSection) return;

    const listingPerPage = 4;
    let currentPage = 1;
    let listings = [];

    let pagination = document.getElementById('pagination-controls');
    if (!pagination) {
        pagination = document.createElement('div');
        pagination.id = 'pagination-controls';
        pagination.className = 'd-flex justify-content-center align-items-center my-3 gap-2';
        listingsSection.parentNode.insertBefore(pagination, listingsSection.nextSibling);
    }

    try {
        const resp = await fetch("./airbnb_sf_listings_500.json");
        
        listings = await resp.json();
    } catch (e) {
        listingsSection.insertAdjacentHTML('beforeend', `<div class="text-danger">Failed to load listings.</div>`);
        return;
    }
    listings = listings.slice(0, 50);

    function renderPage(page) {
        listingsSection.querySelectorAll('.listing').forEach(el => el.remove());
        const start = (page - 1) * listingPerPage;
        const end = start + listingPerPage;
        const pageListings = listings.slice(start, end);
        pageListings.forEach(listing => {
            let amenities = listing.amenities.toString();
            amenities = amenities.replace(/,/g, ', ');
            amenities = amenities.replace(/"/g, '');
            amenities = amenities.replace(/{|}/g, '');
            amenities = amenities.replace(/\\u([0-9a-fA-F]{4})/g, (match, grp) => String.fromCharCode(parseInt(grp, 16)));

            const hostPhoto = listing.host_thumbnail_url || listing.host_picture_url || '';
            const cardHtml = `
            <div class="listing col-6">
                <article class="card">
                    <img src="${listing.picture_url || ''}" alt="Thumbnail for ${listing.name || ''}" class="card-img-top" style="object-fit:cover;max-height:200px">
                    <div class="card-body">
                        <h3 class="card-title">${listing.name || ''}</h3>
                        <div class="host">
                            ${hostPhoto ? `<img src="${hostPhoto}" alt="${listing.host_name}" class="rounded-circle" style="object-fit:cover;width:32px;height:32px">` : ''}
                            <span>${listing.host_name || ''}</span>
                        </div>
                        <div class="price">${listing.price || ''}</div>
                        <div class="rating">${listing.review_scores_rating ? `⭐️${listing.review_scores_rating}` : ''}</div>
                        <h6>Description</h6>
                        <div class="description overflow-scroll" style="max-height: 100px;">${listing.description || ''}</div>
                        <h6>Amenities</h6>
                        <div class="amenities overflow-scroll" style="max-height: 100px;">${amenities}</div>
                        <div class="actions">
                            <button class="btn btn-primary">Rent</button>
                        </div>
                    </div>
                </article>
            </div>
            `;
            listingsSection.insertAdjacentHTML('beforeend', cardHtml);
        });
    }

    function renderPagination() {
        const totalPages = Math.ceil(listings.length / listingPerPage);
        pagination.innerHTML = '';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-outline-secondary btn-sm';
        prevBtn.textContent = 'Prev';
        prevBtn.disabled = currentPage === 1;
        prevBtn.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                renderPage(currentPage);
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        pagination.appendChild(prevBtn);

        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'btn btn-outline-primary btn-sm' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            pageBtn.onclick = () => {
                currentPage = i;
                renderPage(currentPage);
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            };
            pagination.appendChild(pageBtn);
        }

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-outline-secondary btn-sm';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.onclick = () => {
            if (currentPage < totalPages) {
                currentPage++;
                renderPage(currentPage);
                renderPagination();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        };
        pagination.appendChild(nextBtn);
    }

    renderPage(currentPage);
    renderPagination();
}

window.addEventListener('DOMContentLoaded', loadListings);
