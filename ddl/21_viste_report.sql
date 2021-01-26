use kpi;
--- vista per report ecl
create or replace view vprojects_custom as
select p.name as project,
       c.project_id as project_id,
       c.wbs as wbs,
       c.lob as lob,
       c.project manager as project manager,
       c.project_alias as project alias,
       c.site as site
  from redmine.projects p
        left join (select x.project_id as project_id,
                          max((case when (x.id = 33) then x.value else null end)) as wbs,
                          max((case when (x.id = 35) then x.value else null end)) as lob,
                          max((case when (x.id = 36) then x.value else null end)) as project_manager,
                          max((case when (x.id = 37) then x.value else null end)) as project_alias,
                          max((case when (x.id = 38) then x.value else null end)) as site
        from
            (select cf.id as id, cv.value as value, cv.project_id as project_id
        from
            redmine.custom_fields cf
        left join (select
            redmine.custom_values.custom_field_id as custom_field_id,
                redmine.custom_values.customized_id as project_id,
                redmine.custom_values.value as value
        from
            redmine.custom_values
        where
            (redmine.custom_values.customized_type = 'project')) cv on ((cv.custom_field_id = cf.id))
        where
            (cf.id in (33 , 35, 36, 37, 38))) x
        group by x.project_id) c on ((c.project_id = p.id)))
