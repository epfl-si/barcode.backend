###########################################################
#  ETL for LIL
#
#  Migrate those tables from MariaDB to PostgreS :
#  - storage_catalyse → storages
#  - sub_storage_catalyse → shelves, boxes
#
#  To use, run :
#    Rscript barcode_migration.R
#
#	 The variable is_simulation :
#  - FALSE : simulate migration, do not write to the database
#  - TRUE  : write to the database
#
#  Insure to have the libraries below already installed.
#
###########################################################

library(DBI)
library(RMariaDB)
library(RPostgres)
library(yaml)
library(httr2)


is_simulation <- FALSE


maria_conf <- yaml::read_yaml("/keybase/team/epfl_lil/old_lhd_barcode/database.yml")
pg_conf <- yaml::read_yaml("/keybase/team/epfl_lil/backend/dev/secrets.yml")


# MariaDB
con_maria <- dbConnect(
  RMariaDB::MariaDB(),
  host = maria_conf$test$barcode_admin$host,
  dbname = maria_conf$test$barcode_admin$dbname,
  user = maria_conf$test$barcode_admin$user,
  password = maria_conf$test$barcode_admin$password,
  port = 3306
)

# Postgres
con_postgres <- dbConnect(
  RPostgres::Postgres(),
  host = pg_conf$database$host,
  dbname = pg_conf$database$name,
  user = pg_conf$database$user,
  password = pg_conf$database$password,
  port = 5432
)

storage_catalyse <- dbReadTable(con_maria, "storage_catalyse")

# stoType_catalyse
# id_stoTye: 1, stoType: cabinet, id: 1, short_name: A, symbol: ARMRE
# id_stoTye: 2, stoType: refrigerator, id: 7, short_name: R, symbol: FRDGE
# id_stoTye: 3, stoType: freezer, id: 3, short_name: C, symbol: FREEZ
# id_stoTye: 4, stoType: glovebox, id: 2, short_name: B, symbol: GLVBX
# id_stoTye: 5, stoType: bookcase, id: ?, short_name: ?, symbol: ?
# id_stoTye: 6, stoType: shelf, id: 6, short_name: Y, symbol: SHLVG
# id_stoTye: 7, stoType: room, id: 4, short_name: E, symbol: EXLOC
# id_stoTye: 7, stoType: room, id: 5, short_name: I, symbol: INLOC
# id_stoTye: ?, stoType: ?, id: 8, short_name: U, symbol: OTHER
#
# stoPlace_catalyse
# id_stoPlace: 1, stoPlace: hall
# id_stoPlace: 2, stoPlace: room
# id_stoPlace: 3, stoPlace: terrace
get_storage_type <- function(stotype, stoplace) {
  if (stotype == 1) {
    1
  } else if (stotype == 2) {
    7
  } else if (stotype == 3) {
    3
  } else if (stotype == 4) {
    2
  } else if (stotype == 6) {
    6
  } else if (stotype == 7) {
    if (stoplace == 2) 5 else 4
  } else {
    8
  }
}

# content
# G → 1
# C → 2
# ? → 3
get_product_type <- function(content) {
  if (content == "G") {
    1
  } else if (content == "C") {
    2
  } else {
    3
  }
}

# stoProperty_catalyse
# id_stoProperty: 1, stoProperty: standard, id: 3, shortname: S, symbol: STDRD
# id_stoProperty: 2, stoProperty: ventilated, id: 4, shortname: V, symbol: VENTD
# id_stoProperty: 3, stoProperty: fire proof, id: 2, shortname: R, symbol: FR90
# id_stoProperty: 4, stoProperty: ventilated and fire proof, id: 5, shortname: F, symbol: VFR90
# id_stoProperty: 5, stoProperty: ATEX, id: 1, shortname: X, symbol: ATEX
# id_stoProperty: ?, stoProperty: ?, id: 6, shortname: A, symbol: OTHER
get_sub_storage_type <- function(stoproperty) {
  if (stoproperty == 1) {
    3
  } else if (stoproperty == 2) {
    4
  } else if (stoproperty == 3) {
    2
  } else if (stoproperty == 4) {
    5
  } else if (stoproperty == 5) {
    1
  } else {
    6
  }
}

get_room_id <- function(room_label) {
  room_label <- URLencode(room_label, reserved = TRUE)

  req <- request(sprintf("https://api.epfl.ch/v1/rooms/%s", room_label)) |>
    req_auth_basic(
      pg_conf$SERVICE_ACCOUNT$NAME,
      pg_conf$SERVICE_ACCOUNT$PASSWORD
    ) |>
    req_headers(Accept = "application/json")

  resp <- tryCatch(
    req_perform(req),
    error = function(e) NULL
  )

  if (is.null(resp) || resp_status(resp) >= 400) {
    print(sprintf("Local inexistant : %s", room_label))
    return(-1)
  }

  json <- tryCatch(resp_body_json(resp), error = function(e) NULL)

  if (is.null(json) || is.null(json$id)) {
    print(sprintf("Local inexistant : %s", room_label))
    return(-1)
  }

  json$id
}

get_num_storage <- function(barcode) {
  codes <- strsplit(barcode, "\\.")[[1]]
  if (length(codes) > 3) {
    return(codes[length(codes)])
  }
  1
}

storages <- data.frame(
  #id = seq_len(nrow(storage_catalyse)),
  barcode = storage_catalyse$barcode,
  num_storage = sapply(storage_catalyse$barcode, get_num_storage),
  room_id = sapply(storage_catalyse$lab_display, get_room_id),
  room_display = storage_catalyse$lab_display,
  id_room_type = 1,
  id_product_type = sapply(storage_catalyse$content, get_product_type),
  id_storage_type = mapply(get_storage_type, storage_catalyse$id_stoType, storage_catalyse$id_stoPlace),
  id_storage_subtype = mapply(get_sub_storage_type, storage_catalyse$id_stoProperty),
  created_by = storage_catalyse$author,
  created_on = storage_catalyse$date,
  rmm_status = "Created",
  row.names = NULL
)

if (!is_simulation) {
  dbWriteTable(
    con_postgres,
    "storages",
    storages,
    append = TRUE,
    row.names = FALSE
  )
}

print("******** TABLE STORAGES MIGRATED ******************")

if (is_simulation) {
  storages$id <- seq_len(nrow(storages))
  storages <- storages[, c("id", setdiff(names(storages), "id"))]
} else {
  storages <- dbReadTable(con_postgres, "storages")
}

sub_storage_catalyse <- dbReadTable(con_maria, "sub_storage_catalyse")

map_storage <- merge(
  storage_catalyse[, c("id_storage", "barcode", "author", "date")],
  storages[, c("id", "barcode")],
  by = "barcode",
  all.x = TRUE
)

# Rename column id → id_storages
names(map_storage)[names(map_storage) == "id"] <- "id_storages"

shelves_and_boxes <- merge(
  sub_storage_catalyse,
  map_storage[, c("id_storage", "id_storages", "author", "date")],
  by = "id_storage",
  all.x = TRUE
)

shelve <- shelves_and_boxes[grepl("[0-9]$", shelves_and_boxes$sub_storage_barcode), ]

shelves <- data.frame(
  id_storage = shelve$id_storages,
  barcode = shelve$sub_storage_barcode,
  num_shelf = sub(".*([0-9])$", "\\1", shelve$sub_storage_barcode),
  created_by = shelve$author,
  created_on = shelve$date,
  rmm_status = "Created"
)

duplicates <- shelves$barcode[duplicated(shelves$barcode)]

if (length(duplicates) > 0) {
  print(duplicates)
  stop("ERROR: some shelves have duplicate barcodes")
} else {
  print("No duplicated barcode in shelves")
}

if (!is_simulation) {
  dbWriteTable(
    con_postgres,
    "shelves",
    shelves,
    append = TRUE,
    row.names = FALSE
  )
}

print("******** TABLE SHELVES MIGRATED ******************")

if (is_simulation) {
  shelves$id <- seq_len(nrow(shelves))
  shelves <- shelves[, c("id", setdiff(names(shelves), "id"))]
} else {
  shelves <- dbReadTable(con_postgres, "shelves")
}

boxe <- shelves_and_boxes[grepl("[A-Z]$", shelves_and_boxes$sub_storage_barcode), ]

boxe$shelf_barcode <- sub(".$", "", boxe$sub_storage_barcode)

boxe <- merge(
  boxe,
  shelves[, c("id", "barcode")],
  by.x = "shelf_barcode",
  by.y = "barcode",
  all.x = TRUE
)

missing_shelf <- boxe[is.na(boxe$id), ]

if (nrow(missing_shelf) > 0) {
  print(missing_shelf[, c("sub_storage_barcode", "shelf_barcode")])

  # Remove boxes withous shelves
  boxe <- boxe[!is.na(boxe$id), ]

  print("Boxes without shelves have been removed")

  # TODO : what to do with the missing boxes ? Transform them to shelves ? as :
  # missing_shelves <- unique(data.frame(
  #   id_storage = missing_shelf$id_storages,
  #   barcode = missing_shelf$sub_storage_barcode,
  #   num_shelf = match(sub(".*([A-Z])$", "\\1", missing_shelf$sub_storage_barcode), LETTERS),
  #   created_by = missing_shelf$author,
  #   created_on = missing_shelf$date,
  #   rmm_status = "Created"
  # ))

  # if (!is_simulation) {
  #   dbWriteTable(
  #     con_postgres,
  #     "shelves",
  #     missing_shelves,
  #     append = TRUE,
  #     row.names = FALSE
  #   )
  #
  #   print("******** TABLE MISSINGS BOXES → SHELVES MIGRATED ******************")
  # }
}

boxes <- data.frame(
  id_shelf = boxe$id,
  barcode = boxe$sub_storage_barcode,
  num_box = match(sub(".*([A-Z])$", "\\1", boxe$sub_storage_barcode), LETTERS),
  created_by = boxe$author,
  created_on = boxe$date,
  rmm_status = "Created"
)

if (!is_simulation) {
  dbWriteTable(
    con_postgres,
    "boxes",
    boxes,
    append = TRUE,
    row.names = FALSE
  )
}

print("******** TABLE BOXES MIGRATED ******************")

dbDisconnect(con_postgres)
dbDisconnect(con_maria)
