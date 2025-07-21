import sqlite3
conn = sqlite3.connect("sqlite.db")

ins =  ' insert into student (st_id,st_name,st_class,st_email) VALUES (3, "Vishnu", "3rd", "vishnu@gmail.com") '
conn.execute(ins)
conn.commit()
conn.close()