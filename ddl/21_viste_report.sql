use kpi;
-- vista per report ecl
create or replace view vproject_custom as
select p.name as project,
       p.project_id as project_id,
       c.wbs as wbs,
       c.lob as lob,
       c.project_manager,
       c.project_alias,
       c.site as site
  from redmine.projects p
  left join (select x.project_id as project_id,
                    max((case when (x.id = 33) then x.value else null end)) as wbs,
                    max((case when (x.id = 35) then x.value else null end)) as lob,
                    max((case when (x.id = 36) then x.value else null end)) as project_manager,
                    max((case when (x.id = 37) then x.value else null end)) as project_alias,
                    max((case when (x.id = 38) then x.value else null end)) as site
               from (select cf.id, 
                            cv.value, 
                            cv.project_id 
                       from redmine.custom_fields cf
                  left join (select custom_field_id,
                                    customized_id as project_id,
                                    value as value
                               from redmine.custom_values
                              where customized_type = 'Project') cv on cv.custom_field_id = cf.id
              where cf.id in (33 , 35, 36, 37, 38)) x
              group by x.project_id) c on c.project_id = p.id
