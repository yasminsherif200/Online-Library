window.onload = function() {
    
    const urlParams = new URLSearchParams(window.location.search);
    const bookId = urlParams.get('id');
    
    const idField = document.getElementById('bookID');
    if (bookId && idField) {
        idField.value = bookId;
    }
};

function deleteBook(button) {
    if (confirm("Are you sure you want to delete this book?")) {
        let row = button.closest('tr');
        row.remove();
        alert("Book removed successfully from the system.");
    }
}

function returnBook(button) {
    if (confirm("Do you want to return this book to the library?")) {
        let row = button.closest('tr');
        row.remove();
        alert("Book returned successfully. Thank you!");
    }
}


function borrowBook(bookName) {
    alert("The book '" + bookName + "' has been added to your borrowed list!");
}

function searchFunction() {
    let input = document.getElementById("searchInput").value.toLowerCase();
    let table = document.getElementById("searchTable");
    if (!table) return;

    let tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        let tdName = tr[i].getElementsByTagName("td")[1]; 
        let tdAuthor = tr[i].getElementsByTagName("td")[2]; 
        
        if (tdName || tdAuthor) {
            let nameVal = tdName.textContent || tdName.innerText;
            let authorVal = tdAuthor.textContent || tdAuthor.innerText;
            
            if (nameVal.toLowerCase().indexOf(input) > -1 || authorVal.toLowerCase().indexOf(input) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}


document.addEventListener('submit', function(e) {
    
    if (e.target.id === 'editBookForm') {
        let bName = document.getElementById('bookName').value.trim();
        if (bName === "") {
            alert("Error: Book Name cannot be empty!");
            e.preventDefault();
        } else {
            alert("Success: Changes saved for Book ID " + document.getElementById('bookID').value);
        }
    }


    if (e.target.id === 'userProfileForm') {
        alert("Success: Your profile information has been updated!");
        e.preventDefault();
    }
});