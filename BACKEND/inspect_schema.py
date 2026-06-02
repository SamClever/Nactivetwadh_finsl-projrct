import pymysql

conn = pymysql.connect(host='localhost', user='root', password='12345', database='nactvet_system')
cur = conn.cursor()
for tbl in ['users', 'institutions', 'applications', 'reviews', 'team_members']:
    try:
        cur.execute(f'SHOW CREATE TABLE {tbl}')
        print('---', tbl, '---')
        print(cur.fetchone()[1])
    except Exception as e:
        print('ERROR', tbl, e)
cur.close()
conn.close()
