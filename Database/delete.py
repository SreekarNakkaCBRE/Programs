import sqlite3
conn = sqlite3.connect("sqlite.db")
id = input("Enter Id to delete:")
conn.execute("DELETE FROM student where st_id="+ id)
conn.commit()
conn.close()