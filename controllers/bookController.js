const Book = require("../models/book");
const Author = require("../models/author");

const { body, validationResult } = require("express-validator");
const asyncHandler = require("express-async-handler");

// Display list of all books.
exports.book_list = asyncHandler(async (req, res, next) => {
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("book_list", { title: "Book List", book_list: allBooks });
});

// Display detail page for a specific book.
exports.book_detail = asyncHandler(async (req, res, next) => {
  const [book] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
    // Remove the part related to book instances
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_detail", {
    title: book.title,
    book: book,
    // Remove the part related to book instances
  });
});

// Display book create form on GET.
exports.book_create_get = asyncHandler(async (req, res, next) => {
  // Get all authors, which we can use for adding to our book.
  const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

  res.render("book_form", {
    title: "Create Book",
    authors: allAuthors,
  });
});

// Handle book create on POST.
exports.book_create_post = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  // Process request after validation and sanitization.
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from a request.
    const errors = validationResult(req);

    // Create a Book object with escaped and trimmed data.
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
    });

    if (!errors.isEmpty()) {
      // There are errors. Render form again with sanitized values/error messages.

      // Get all authors for form.
      const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

      res.render("book_form", {
        title: "Create Book",
        authors: allAuthors,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Save book.
      await book.save();
      res.redirect(book.url);
    }
  }),
];

// Display book delete form on GET.
exports.book_delete_get = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author").exec();

  if (book === null) {
    // No results.
    res.redirect("/catalog/books");
  }

  res.render("book_delete", {
    title: "Delete Book",
    book: book,
    // Remove the part related to book instances
  });
});

// Handle book delete on POST.
exports.book_delete_post = asyncHandler(async (req, res, next) => {
  const book = await Book.findById(req.params.id).populate("author").exec();

  if (book === null) {
    // No results.
    res.redirect("/catalog/books");
  }

  // Book has no BookInstance objects. Delete object and redirect to the list of books.
  await Book.findByIdAndDelete(req.body.id);
  res.redirect("/catalog/books");
});

// Display book update form on GET.
exports.book_update_get = asyncHandler(async (req, res, next) => {
  // Get book and authors for form.
  const [book, allAuthors] = await Promise.all([
    Book.findById(req.params.id).populate("author").exec(),
    Author.find().sort({ family_name: 1 }).exec(),
  ]);

  if (book === null) {
    // No results.
    const err = new Error("Book not found");
    err.status = 404;
    return next(err);
  }

  res.render("book_form", {
    title: "Update Book",
    authors: allAuthors,
    book: book,
    // Remove the part related to genres
  });
});

// Handle book update on POST.
exports.book_update_post = [
  // Validate and sanitize fields.
  body("title", "Title must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("author", "Author must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),
  body("summary", "Summary must not be empty.")
    .trim()
    .isLength({ min: 1 })
    .escape(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    const book = new Book({
      title: req.body.title,
      author: req.body.author,
      summary: req.body.summary,
      _id: req.params.id, // This is required, or a new ID will be assigned!
    });

    if (!errors.isEmpty()) {
 
      // Get all authors for form.
      const allAuthors = await Author.find().sort({ family_name: 1 }).exec();

      res.render("book_form", {
        title: "Update Book",
        authors: allAuthors,
        book: book,
        errors: errors.array(),
      });
    } else {
      // Data from form is valid. Update the record.
      await Book.findByIdAndUpdate(req.params.id, book, {});
      res.redirect(book.url);
    }
  }),
];
exports.index = asyncHandler(async (req, res, next) => {
  // Your code for displaying the home page, for example:
  const allBooks = await Book.find({}, "title author")
    .sort({ title: 1 })
    .populate("author")
    .exec();

  res.render("index", { title: "Home", book_list: allBooks });
});
