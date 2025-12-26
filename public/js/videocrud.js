$(document).on('click', '.delete-btn', function (e) {
    e.preventDefault();

    let route = $(this).data('route');
    let token = $('meta[name="csrf-token"]').attr('content');

    Swal.fire({
        title: 'Are you sure?',
        text: 'To delete this video!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: route,
                type: 'POST',
                data: {
                    _token: token,
                    _method: 'GET'
                },
                success: function (res) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Deleted!',
                        text: res.message,
                        timer: 1500,
                        showConfirmButton: false
                    }).then(() => {
                        location.reload(); // or remove card
                    });
                },
                error: function () {
                    Swal.fire('Error', 'Delete failed!', 'error');
                }
            });
        }
    });
});

$(document).on('click', '.edit-btn', function (e) {
    e.preventDefault();

    let route = $(this).data('route');

    window.location.href = route;
});
$(document).on('click', '.reload-subtitle-btn', function (e) {
    e.preventDefault();
    e.stopPropagation();

    let route = $(this).data('route');

    Swal.fire({
        title: 'Reload transcript?',
        text: 'Try fetching subtitles again.',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Reload'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                url: route,
                type: 'POST',
                success: function (res) {
                    Swal.fire(
                        res.success ? 'Success' : 'Not Available',
                        res.message,
                        res.success ? 'success' : 'warning'
                    ).then(() => {
                        if (res.success) location.reload();
                    });
                },
                error: function (xhr) {
                    console.error(xhr.responseText);
                    Swal.fire('Error', 'CSRF or server error', 'error');
                }
            });
        }
    });
});


$(document).ready(function () {
    $('#thumbnailInput').on('change', function (e) {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = function (ev) {
            let $img = $('.thumb-preview img');

            if ($img.length === 0) {
                $img = $('<img>');
                $('.thumb-preview').append($img);
            }

            $img.attr('src', ev.target.result);
        };

        reader.readAsDataURL(file);
    });
});
// $(document).on('click', '.reload-subtitle-btn', function (e) {
//     e.preventDefault();
//     e.stopImmediatePropagation();

//     let route = $(this).data('route');
//     let token = $('meta[name="csrf-token"]').attr('content');

//     Swal.fire({
//         title: 'Reload transcript?',
//         text: 'Try fetching subtitles again.',
//         icon: 'question',
//         showCancelButton: true,
//         confirmButtonText: 'Reload'
//     }).then((result) => {
//         if (result.isConfirmed) {
//             $.post(route, { _token: token }, function (res) {
//                 Swal.fire(
//                     res.success ? 'Success' : 'Not Available',
//                     res.message,
//                     res.success ? 'success' : 'warning'
//                 ).then(() => {
//                     if (res.success) location.reload();
//                 });
//             });
//         }
//     });
// });







